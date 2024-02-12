import { Injectable, Logger } from '@nestjs/common';
import { MemcachedProvider } from './memcached.provider';
import { CacheSerializationProvider } from './compression.provider';
import { ICacheProvider, TTLBucket } from './i-cache-provider';

const formatTTL = (ttl: number): string => {
  if (ttl < 60) {
    return `${ttl} seconds`;
  } else if (ttl < 60 * 60) {
    return `${Math.round(ttl / 60)} minutes`;
  } else {
    return `${Math.round(ttl / 60 / 60)} hours`;
  }
};

const printTable = (data: any[][]) => {
  // Track the maximum width of each column
  const colWidths = data[0].map(() => 0);

  // Compute the maximum width of each column
  for (const row of data) {
    for (const [i, cell] of row.entries()) {
      colWidths[i] = Math.max(colWidths[i], cell.length);
    }
  }

  // Print the table

  // Print the table header
  for (const [i, cell] of data[0].entries()) {
    process.stdout.write(cell.padEnd(colWidths[i] + 1));
  }

  process.stdout.write('\n');

  // Print the table rows
  for (const row of data.slice(1)) {
    for (const [i, cell] of row.entries()) {
      process.stdout.write(cell.padEnd(colWidths[i] + 1));
    }

    process.stdout.write('\n');
  }
};

type TTLSeconds = {
  [key in Exclude<TTLBucket, TTLBucket.Never>]: { min: number; max: number };
};

@Injectable()
export class MemcachedCacheProvider implements ICacheProvider {
  private hotCache = new Map<
    string,
    {
      setAt: number;
      bucket: TTLBucket;
      stored: boolean;
      lastAccess: number;
      data?: any;
    }
  >();

  // Time without access in milliseconds before removing from hot store
  private readonly hotStoreTimeout = 5 * 1000;

  // Interval in milliseconds to prune hot store
  private readonly hotStorePruneInterval = 1 * 1000;

  private readonly logger = new Logger(MemcachedCacheProvider.name);

  // TTL in seconds
  private readonly ttlSeconds: TTLSeconds = {
    [TTLBucket.Short]: { min: 1 * 60, max: 60 * 60 },
    [TTLBucket.Long]: { min: 30 * 60, max: 4 * 60 * 60 },
  };

  constructor(
    private memcachedProvider: MemcachedProvider,
    private cacheSerializationProvider: CacheSerializationProvider,
  ) {
    this.logger.verbose('Initializing ArticleCacheProvider');

    // Periodically prune the hot store
    setInterval(() => this.prune(), this.hotStorePruneInterval);

    if (process.argv.includes('--debug-cache')) {
      this.debugCache();
    }
  }

  private debugCache() {
    // Only for debugging, fill console every second with cache stats
    setInterval(() => {
      // Clear console and use process.stdout.write to avoid newlines
      process.stdout.write('\x1Bc');

      // table header

      const data = [['Key', 'Stored']];

      // table rows

      this.hotCache.forEach((value, key) => {
        data.push([key, value.stored ? 'Yes' : 'No']);
      });

      printTable(data);
    }, 1000);
  }

  async set(key: string, value: any, bucket: TTLBucket = TTLBucket.Short) {
    if (this.hotCache.has(key)) {
      this.deleteHot(key);
    }

    this.logger.verbose(`Caching key: ${key}`);

    if (bucket === TTLBucket.Never) {
      this.hotCache.set(key, {
        setAt: Date.now(),
        bucket,
        lastAccess: Date.now(),
        stored: false,
      });

      this.logger.verbose(`Cached non-expiring key: ${key}`);
      return;
    }

    const now = Date.now();

    const ttlSeconds = this.ttlSeconds[bucket];

    this.hotCache.set(key, {
      setAt: now,
      data: value,
      bucket,
      lastAccess: now,
      stored: false,
    });

    this.logger.verbose(
      `Cached key: ${key} with TTL ${formatTTL(ttlSeconds.min)}`,
    );

    try {
      const serialized = await this.cacheSerializationProvider.serialize({
        data: await value, // value may be a promise
        setAt: now,
        bucket,
      });
      await this.memcachedProvider.client?.set(key, serialized, {
        expires: ttlSeconds.min,
      });
      const item = this.hotCache.get(key);
      if (item) {
        item.stored = true;
      }
    } catch (err) {
      this.logger.error(`Failed to cache key in memcached: ${key}`, err);
    }
  }

  async get(key: string) {
    const item = this.hotCache.get(key);
    if (item) {
      item.lastAccess = Date.now();
      return item.data;
    }

    try {
      const data = await this.memcachedProvider.client.get(key);
      if (data?.value) {
        this.logger.verbose(`Cache hit for key: ${key}`);

        // Decompress and cache in hot store
        const deserialized = await this.cacheSerializationProvider.deserialize(
          data.value,
        );

        const ttlSeconds =
          this.ttlSeconds[deserialized.bucket as keyof TTLSeconds];

        // Touch the cache entry in memcached, extending its TTL up to maxTTLSeconds
        const newTTL = Math.min(
          // memcached expects TTL in seconds that starts from now, not from the time the item was set
          // in other words, here we need to compare against when the maxTTLSeconds would expire
          // based on when it was set, and pass in the difference between that and now
          ttlSeconds.max - Math.round((deserialized.setAt - Date.now()) / 1000),
          // TTL extended by .min
          ttlSeconds.min,
        );

        if (newTTL > 0) {
          await this.memcachedProvider.client
            .touch(key, newTTL)
            .catch((err) => {
              this.logger.error(
                `Failed to extend TTL in memcached for key: ${key}`,
                err,
              );
            });
        }
        this.hotCache.set(key, {
          setAt: deserialized.setAt,
          bucket: deserialized.bucket,
          data: deserialized.data,
          lastAccess: Date.now(),
          stored: true,
        });

        return deserialized.data;
      }
    } catch (err) {
      this.logger.error(
        `Failed to get cache entry from memcached for key: ${key}`,
        err,
      );

      // Delete the cache entry
      this.deleteHot(key);

      return null;
    }
  }

  private deleteHot(key: string) {
    this.hotCache.delete(key);
    this.logger.verbose(`Deleted hot cache for key: ${key}`);
  }

  async delete(key: string) {
    this.deleteHot(key);
    await this.memcachedProvider.client?.delete(key);
  }

  private async prune() {
    const now = Date.now();

    const toDelete: string[] = [];

    for (const [key, item] of this.hotCache.entries()) {
      if (
        item.stored &&
        item.bucket !== TTLBucket.Never &&
        now - item.lastAccess > this.hotStoreTimeout
      ) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.logger.verbose(`Pruning key: ${key} from hot store`);
      this.deleteHot(key);
    }
  }
}

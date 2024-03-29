import { Injectable, Logger } from '@nestjs/common';
import { CacheSerializationProvider as CacheSerializationProvider } from './compression.provider';
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

enum DataLocation {
  Hot,
  Cool,
}

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
export class InMemoryCacheProvider implements ICacheProvider {
  private cache = new Map<
    string,
    {
      location: DataLocation;
      setAt: number;
      expiresAt: number;
      bucket: TTLBucket;
      temperature: number;
    }
  >();
  private longLivedKeys = new Set<string>();
  private hotStore = new Map<string, any>();
  private coolStore = new Map<string, Buffer>();

  // Interval in milliseconds for cleaning up expired cache entries
  private readonly cleanupInterval = 60 * 1000;

  // Threshold for number of accesses before moving to hot store (if over, move immediately)
  private readonly coldAccessThreshold = 5;

  // Interval in milliseconds for decreasing temperature and moving to cold store
  private readonly coolDownInterval = 30 * 1000;

  // Initial temperature for items when added to cache
  private readonly initialTemperature = 5;

  // Maximum temperature for items in cache
  private readonly maxTemperature = 20;

  private readonly logger = new Logger(InMemoryCacheProvider.name);

  // TTL in seconds
  private readonly ttlSeconds: TTLSeconds = {
    [TTLBucket.Short]: { min: 1 * 60, max: 60 * 60 },
    [TTLBucket.Long]: { min: 30 * 60, max: 4 * 60 * 60 },
  };

  constructor(private readonly serializer: CacheSerializationProvider) {
    this.logger.verbose('Initializing ArticleCacheProvider');
    // Periodically clean up expired cache entries
    setInterval(() => this.cleanupExpiredCache(), this.cleanupInterval);

    // Periodically move items from hot to cold store
    setInterval(() => this.coolDown(), this.coolDownInterval);

    if (process.argv.includes('--debug-cache')) {
      this.debugCache();
    }
  }

  private debugCache() {
    // Only for debugging, fill console every second with cache stats:
    // 1. keys
    // 2. where they are stored
    // 3. when they expire
    // 4. their temperature

    setInterval(() => {
      // Clear console and use process.stdout.write to avoid newlines
      process.stdout.write('\x1Bc');

      // table header

      const data = [
        ['Key', 'Location', 'Expires', 'Temperature', 'Long-lived'],
      ];

      // table rows

      this.cache.forEach((value, key) => {
        data.push([
          key,
          DataLocation[value.location],
          new Date(value.expiresAt).toLocaleString(),
          value.temperature.toString(),
          this.longLivedKeys.has(key) ? 'yes' : 'no',
        ]);
      });

      printTable(data);
    }, 1000);
  }

  set(key: string, value: any, bucket: TTLBucket = TTLBucket.Short) {
    if (this.cache.has(key)) {
      this.delete(key);
    }

    this.logger.verbose(`Caching key: ${key}`);

    if (bucket === TTLBucket.Never) {
      this.cache.set(key, {
        location: DataLocation.Hot,
        setAt: Date.now(),
        expiresAt: 0,
        bucket,
        temperature: this.initialTemperature,
      });
      this.hotStore.set(key, value);
      this.longLivedKeys.add(key);

      this.logger.verbose(`Cached non-expiring key: ${key}`);
      return;
    }

    const ttlSeconds = this.ttlSeconds[bucket];
    const expiresAt = Date.now() + ttlSeconds.min * 1000;

    // this.cache.set(key, { data: value, setAt: Date.now(), expiresAt, bucket });
    this.cache.set(key, {
      location: DataLocation.Hot,
      setAt: Date.now(),
      expiresAt,
      bucket,
      temperature: bucket === TTLBucket.Short ? 0 : this.initialTemperature,
    });
    this.hotStore.set(key, value);
    if (bucket === TTLBucket.Long) {
      this.longLivedKeys.add(key);
    }

    this.logger.verbose(
      `Cached key: ${key} with TTL ${formatTTL(ttlSeconds.min)}`,
    );
  }

  async get(key: string) {
    const item = this.cache.get(key);
    if (!item) {
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    if (item.bucket !== TTLBucket.Never && Date.now() > item.expiresAt) {
      this.logger.verbose(`Cache expired for key: ${key}`);
      this.delete(key);
      return null;
    }

    if (item.bucket !== TTLBucket.Short) {
      item.temperature = Math.min(item.temperature + 1, this.maxTemperature);
    }

    let data: any;

    if (item.location === DataLocation.Hot) {
      data = this.hotStore.get(key);
    }

    if (!data) {
      try {
        data = await this.serializer.deserialize(this.coolStore.get(key)!);
      } catch (err) {
        this.logger.error(
          `Failed to decompress cache entry for key: ${key}`,
          err,
        );
        return null;
      }
    }

    if (
      item.location === DataLocation.Cool &&
      item.temperature > this.coldAccessThreshold
    ) {
      // Move to hot store
      this.logger.verbose(
        `Moving key: ${key} to hot store after ${item.temperature} accesses`,
      );

      this.hotStore.set(key, data);
      this.coolStore.delete(key);
      item.location = DataLocation.Hot;
      item.temperature = 0;
    }

    if (item.bucket === TTLBucket.Never) {
      this.logger.verbose(`Cache hit for non-expiring key: ${key}`);
      return data;
    }

    // Extend the TTL of the key by minTTLSeconds, but only up to maxTTLSeconds

    const newExpiresAt = Math.min(
      Date.now() + this.ttlSeconds[item.bucket].min * 1000,
      item.setAt + this.ttlSeconds[item.bucket].max * 1000,
    );

    if (newExpiresAt > item.expiresAt) {
      // Update the cache entry with the new expiry time
      item.expiresAt = newExpiresAt;
    }

    this.logger.verbose(`Cache hit for key: ${key}`);
    return data;
  }

  delete(key: string) {
    this.cache.delete(key);
    this.hotStore.delete(key);
    this.coolStore.delete(key);
    this.longLivedKeys.delete(key);
    this.logger.verbose(`Deleted cache for key: ${key}`);
  }

  private async coolDown() {
    const toCoolDown = new Map<
      string,
      typeof InMemoryCacheProvider.prototype.cache extends Map<unknown, infer V>
        ? V
        : never
    >();

    for (const key of this.longLivedKeys) {
      const item = this.cache.get(key)!;

      if (item.temperature > 0) {
        item.temperature--;
      }

      if (item.temperature <= 0) {
        toCoolDown.set(key, item);
      }
    }

    await Promise.all(
      Array.from(toCoolDown.entries()).map(async ([key, item]) => {
        this.logger.verbose(`Cooling down key: ${key}`);
        const value = this.hotStore.get(key);
        if (value) {
          let compressed: Buffer;
          try {
            compressed = await this.serializer.serialize(
              await value, // value may be a promise
            );
          } catch (err) {
            this.logger.error(
              `Failed to compress cache entry for key: ${key}`,
              err,
            );
            return;
          }

          this.coolStore.set(key, compressed);
          this.hotStore.delete(key);
          item.location = DataLocation.Cool;
          item.temperature = 0;
        }
      }),
    );
  }

  private cleanupExpiredCache() {
    const now = Date.now();
    this.cache.forEach((value, key) => {
      if (value.bucket !== TTLBucket.Never && now > value.expiresAt) {
        this.logger.verbose(`Cache expired for key: ${key}`);
        this.delete(key);
      }
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ICacheProvider, TTLBucket } from './i-cache-provider';
import { LRUCache } from 'lru-cache';

const formatTTL = (ttl: number): string => {
  if (ttl < 60) {
    return `${ttl} seconds`;
  } else if (ttl < 60 * 60) {
    return `${Math.round(ttl / 60)} minutes`;
  } else {
    return `${Math.round(ttl / 60 / 60)} hours`;
  }
};

type TTLSeconds = {
  [key in Exclude<TTLBucket, TTLBucket.Never>]: { min: number; max: number };
};

interface TTLRecord {
  value: any;
  setAt: number;
  bucket: TTLBucket;
}

@Injectable()
export class InMemoryCacheProvider implements ICacheProvider {
  // lru-cache for keys that expire.
  private ttlCache: LRUCache<string, TTLRecord>;
  // Map for non-expiring keys.
  private nonExpiringCache = new Map<string, any>();
  private readonly logger = new Logger(InMemoryCacheProvider.name);

  // TTL in seconds
  private readonly ttlSeconds: TTLSeconds = {
    [TTLBucket.Short]: { min: 1 * 60, max: 60 * 60 },
    [TTLBucket.Long]: { min: 30 * 60, max: 4 * 60 * 60 },
  };

  constructor() {
    this.logger.verbose('Initializing InMemoryCacheProvider');
    this.ttlCache = new LRUCache<string, TTLRecord>({
      max: 1000,
    });
  }

  set(key: string, value: any, bucket: TTLBucket = TTLBucket.Short) {
    // If key already exists, remove it first.
    this.delete(key);
    if (bucket === TTLBucket.Never) {
      this.nonExpiringCache.set(key, value);
      this.logger.verbose(`Cached non-expiring key: ${key}`);
      return;
    }

    const now = Date.now();
    const ttlConfig = this.ttlSeconds[bucket];
    // "min" is the initial TTL.
    const ttlMs = ttlConfig.min * 1000;
    const record: TTLRecord = { value, setAt: now, bucket };
    this.ttlCache.set(key, record, { ttl: ttlMs });
    this.logger.verbose(
      `Cached key: ${key} with TTL ${formatTTL(ttlConfig.min)}`,
    );
  }

  async get(key: string) {
    // Try non-expiring cache first.
    if (this.nonExpiringCache.has(key)) {
      this.logger.verbose(`Cache hit for non-expiring key: ${key}`);
      return this.nonExpiringCache.get(key);
    }

    // For TTL keys, retrieve the record from lru-cache.
    const record = this.ttlCache.get(key, { updateAgeOnGet: false });
    if (!record) {
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    const ttlConfig = this.ttlSeconds[record.bucket as keyof TTLSeconds];
    // Determine the maximum allowed expiry time since the value was set.
    const maxExpiry = record.setAt + ttlConfig.max * 1000;
    if (Date.now() > maxExpiry) {
      this.logger.verbose(`Cache expired (max TTL reached) for key: ${key}`);
      this.ttlCache.delete(key);
      return null;
    }

    // Extend the TTL on each get:
    // New expiration is the lesser of (now + minTTL) and (setAt + maxTTL)
    const newExpiresAt = Math.min(Date.now() + ttlConfig.min * 1000, maxExpiry);
    const newTTL = newExpiresAt - Date.now();
    // Update the record to extend its TTL.
    this.ttlCache.set(key, record, { ttl: newTTL });

    this.logger.verbose(`Cache hit for key: ${key}`);
    return record.value;
  }

  delete(key: string) {
    if (this.nonExpiringCache.has(key)) {
      this.nonExpiringCache.delete(key);
    }
    if (this.ttlCache.has(key)) {
      this.ttlCache.delete(key);
    }
    this.logger.verbose(`Deleted cache for key: ${key}`);
  }
}

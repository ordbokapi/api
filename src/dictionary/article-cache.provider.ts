import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ArticleCacheProvider {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly cleanupInterval = 60000;
  private readonly logger = new Logger(ArticleCacheProvider.name);

  constructor() {
    this.logger.debug('Initializing ArticleCacheProvider');
    // Periodically clean up expired cache entries
    setInterval(() => this.cleanupExpiredCache(), this.cleanupInterval);
  }

  set(key: string, value: any, ttlSeconds: number = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data: value, expiresAt });
    this.logger.debug(`Set cache for key: ${key}`);
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) {
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return item.data;
  }

  private cleanupExpiredCache() {
    const now = Date.now();
    this.cache.forEach((value, key) => {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        this.logger.debug(`Cleaned up expired cache for key: ${key}`);
      }
    });
  }
}

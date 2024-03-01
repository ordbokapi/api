import { Injectable, Logger } from '@nestjs/common';
import * as memjs from 'memjs';
import { BuildInfoProvider } from './build-info.provider';

@Injectable()
export class MemcachedProvider {
  private readonly logger = new Logger(MemcachedProvider.name);

  // Expect config from env vars:
  //   MEMCACHEDCLOUD_SERVERS
  //   MEMCACHEDCLOUD_USERNAME
  //   MEMCACHEDCLOUD_PASSWORD

  // Create a memcached client if config is present, otherwise return null
  readonly client = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
    username: process.env.MEMCACHEDCLOUD_USERNAME,
    password: process.env.MEMCACHEDCLOUD_PASSWORD,
  });

  constructor(private buildInfo: BuildInfoProvider) {
    // If the build ID does not match the ID in the cache, clear the cache
    this.client.get('buildId', (error, buffer) => {
      if (error) {
        this.logger.error('Failed to get build ID from cache', error);

        this.#clear().catch((error) => {
          this.logger.error('Failed to clear cache', error);
        });
        return;
      }

      const cachedBuildId = buffer?.toString();

      if (cachedBuildId !== this.buildInfo.buildId) {
        this.logger.log(
          `Build ID mismatch: ${cachedBuildId} (cached) !== ${this.buildInfo.buildId} (current)`,
        );

        this.#clear().catch((error) => {
          this.logger.error('Failed to clear cache', error);
        });
      }
    });
  }

  async #clear() {
    this.logger.verbose('Clearing memcached');
    await this.client.flush();

    await this.client.set('buildId', this.buildInfo.buildId);
    this.logger.verbose(
      `Updated build ID in cache to ${this.buildInfo.buildId}`,
    );
  }
}

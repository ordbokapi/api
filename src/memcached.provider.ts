import { Injectable, Logger } from '@nestjs/common';
import * as memjs from 'memjs';

@Injectable()
export class MemcachedProvider {
  private readonly logger = new Logger(MemcachedProvider.name);

  // Expect config from env vars:
  //   MEMCACHEDCLOUD_SERVERS
  //   MEMCACHEDCLOUD_USERNAME
  //   MEMCACHEDCLOUD_PASSWORD

  // Create a memcached client if config is present, otherwise return null
  readonly client = process.env.MEMCACHEDCLOUD_SERVERS
    ? memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
        username: process.env.MEMCACHEDCLOUD_USERNAME,
        password: process.env.MEMCACHEDCLOUD_PASSWORD,
      })
    : undefined;
}

import { Module } from '@nestjs/common';
import { WordService, OrdboekeneApiService } from './providers';
import {
  MemcachedProvider,
  InMemoryCacheProvider,
  MemcachedCacheProvider,
  CacheSerializationProvider,
} from '../providers';
import * as resolvers from './resolvers';

@Module({
  providers: [
    ...Object.values(resolvers),
    WordService,
    OrdboekeneApiService,
    MemcachedProvider,
    CacheSerializationProvider,
    {
      provide: 'ICacheProvider',
      useClass: process.env.MEMCACHEDCLOUD_SERVERS
        ? MemcachedCacheProvider
        : InMemoryCacheProvider,
    },
  ],
  exports: [WordService],
})
export class DictionaryModule {}

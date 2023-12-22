import { Module } from '@nestjs/common';
import { WordResolver } from './word.resolver';
import { WordService } from './word.service';
import { ArticleResolver } from './article.resolver';
import {
  MemcachedProvider,
  InMemoryCacheProvider,
  MemcachedCacheProvider,
  CacheSerializationProvider,
} from '../providers';

@Module({
  providers: [
    WordResolver,
    WordService,
    ArticleResolver,
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

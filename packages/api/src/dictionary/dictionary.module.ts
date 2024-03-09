import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  NestProviderCollection,
  providers as commonProviders,
} from 'ordbokapi-common';
import {
  WordService,
  OrdboekeneApiService,
  CacheWrapperService,
} from './providers';
import {
  BuildInfoProvider,
  // MemcachedProvider,
  InMemoryCacheProvider,
  // MemcachedCacheProvider,
  CacheSerializationProvider,
} from '../providers';
import * as resolvers from './resolvers';

@Module({
  imports: [ConfigModule],
  providers: new NestProviderCollection()
    .concat(NestProviderCollection.fromInjectables(commonProviders))
    .concat(NestProviderCollection.fromInjectables(resolvers))
    .concat([BuildInfoProvider, WordService, OrdboekeneApiService])
    // .addIf(process.env.MEMCACHEDCLOUD_SERVERS, MemcachedProvider)
    .add(CacheSerializationProvider)
    // .add({
    //   provide: 'ICacheProvider',
    //   useClass: process.env.MEMCACHEDCLOUD_SERVERS
    //     ? MemcachedCacheProvider
    //     : InMemoryCacheProvider,
    // })
    .add({
      provide: 'ICacheProvider',
      useClass: InMemoryCacheProvider,
    })
    .add(CacheWrapperService)
    .toArray(),
})
export class DictionaryModule {}

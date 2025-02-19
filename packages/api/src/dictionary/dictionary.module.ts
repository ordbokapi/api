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
  UibCacheService,
} from './providers';
import { BuildInfoProvider, InMemoryCacheProvider } from '../providers';
import * as resolvers from './resolvers';

@Module({
  imports: [ConfigModule],
  providers: new NestProviderCollection()
    .concat(NestProviderCollection.fromInjectables(commonProviders))
    .concat(NestProviderCollection.fromInjectables(resolvers))
    .concat([
      BuildInfoProvider,
      WordService,
      OrdboekeneApiService,
      UibCacheService,
    ])
    .add({
      provide: 'ICacheProvider',
      useClass: InMemoryCacheProvider,
    })
    .add(CacheWrapperService)
    .toArray(),
})
export class DictionaryModule {}

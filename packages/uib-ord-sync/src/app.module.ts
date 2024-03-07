import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  NestProviderCollection,
  UibRedisConfig,
  providers as commonProviders,
} from 'ordbokapi-common';
import * as providers from './providers';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: NestProviderCollection.fromInjectables(commonProviders)
    .concat(NestProviderCollection.fromInjectables(providers))
    .add(<Provider>{
      provide: UibRedisConfig,
      useValue: {
        allowWrites: true,
      },
    })
    .toArray(),
})
export class AppModule {}

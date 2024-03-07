import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { isProd } from 'ordbokapi-common';

async function main() {
  await NestFactory.createApplicationContext(AppModule, {
    logger: isProd()
      ? ['warn', 'error', 'fatal']
      : ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
  });
}
main();

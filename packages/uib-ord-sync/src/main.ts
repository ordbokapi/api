import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { isProd } from 'ordbokapi-common';

async function main() {
  const prod = isProd();

  // Disable colour logging in production
  if (prod) {
    process.env.NO_COLOR = 'true';
  }

  await NestFactory.createApplicationContext(AppModule, {
    logger: prod
      ? ['log', 'warn', 'error', 'fatal']
      : ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
  });
}
main();

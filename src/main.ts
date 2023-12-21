import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(new ValidationPipe());

  //await app.listen(3000);

  // read port from CLI (--port 3000), fall back to PORT env variable, fall back to 3000
  const port = process.argv.includes('--port')
    ? process.argv[process.argv.indexOf('--port') + 1]
    : process.env.PORT
      ? Number.parseInt(process.env.PORT)
      : 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

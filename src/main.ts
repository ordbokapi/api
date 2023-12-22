import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as requestIp from 'request-ip';

async function bootstrap() {
  if (process.argv.includes('--help')) {
    console.log(`Usage: node ${process.argv[1]} [options]
Options:
  --help                   Show this help message
  --port <num>             Specify the port to listen on
  --log-level <log-level>  Specify the minimum log level to display
  --debug-cache            Cache debug mode, logs cache stats every second.
                           Disables other logs.
`);
    process.exit(0);
  }

  // Define log levels in order of severity
  const logLevels: LogLevel[] = ['verbose', 'debug', 'warn', 'error', 'fatal'];

  // Get log level from command parameters or environment variable
  let minLogLevel = process.argv.includes('--log-level')
    ? process.argv[process.argv.indexOf('--log-level') + 1]
    : process.env.NODE_ENV === 'production'
      ? 'warn'
      : 'verbose';

  // Validate and normalize the log level
  if (!logLevels.includes(minLogLevel as LogLevel)) {
    console.warn(`Invalid log level "${minLogLevel}", defaulting to "verbose"`);
    minLogLevel = 'verbose';
  }

  // Compute an array of log levels to be passed to the logger
  const logLevelArray = logLevels.slice(
    logLevels.indexOf(minLogLevel as LogLevel),
  );

  // Disable colour logging in production
  if (process.env.NODE_ENV === 'production') {
    process.env.NO_COLOR = 'true';
  }

  const port = process.argv.includes('--port')
    ? process.argv[process.argv.indexOf('--port') + 1]
    : process.env.PORT
      ? Number.parseInt(process.env.PORT)
      : 3000;

  const cacheDebug = process.argv.includes('--debug-cache');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    cacheDebug ? { logger: [] } : { logger: ['log', ...logLevelArray] },
  );

  app.use(requestIp.mw());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], _res: FastifyReply['raw'], next: () => void) {
    const logger = new Logger('Request');
    logger.log(
      `${(req as any).clientIp} ${req.method} ${(req as any).originalUrl}`,
    );
    next?.();
  }
}

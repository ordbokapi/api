import { readFileSync } from 'fs';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BuildInfoProvider {
  #buildId: string;

  constructor() {
    const logger = new Logger(BuildInfoProvider.name);

    try {
      this.#buildId = readFileSync('dist/BUILD_HEAD', 'utf8')
        .trim()
        .substring(0, 7);
    } catch (error) {
      this.#buildId = 'unknown';
      logger.warn('Failed to read build info', error);
    }
  }

  get buildId(): string {
    return this.#buildId;
  }
}

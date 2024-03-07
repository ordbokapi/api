import { Injectable, Logger } from '@nestjs/common';
import { Processor, Queue, Worker } from 'bullmq';
import { ArticleMetadata, RedisService, UiBDictionary } from 'ordbokapi-common';

/**
 * Job queues.
 */
export enum JobQueue {
  /** The queue for fetching article lists from the UiB API. */
  FetchArticleList = 'fetch-article-list',

  /** The queue for fetching articles from the UiB API. */
  FetchArticle = 'fetch-article',

  /** The queue for fetching dictionary metadata. */
  FetchDictionaryMetadata = 'fetch-dictionary-metadata',
}

/**
 * Job queue payload types.
 */
export type JobPayload = {
  [JobQueue.FetchArticleList]: {
    dictionary: UiBDictionary;
  };
  [JobQueue.FetchDictionaryMetadata]: {
    dictionary: UiBDictionary;
  };
  [JobQueue.FetchArticle]: {
    dictionary: UiBDictionary;
    metadata: ArticleMetadata;
  };
};

/**
 * A service for managing job queues.
 */
@Injectable()
export class JobQueueService {
  #queues = new Map<JobQueue, Queue>();
  #logger = new Logger(JobQueueService.name);
  #workers: Worker<unknown, unknown, JobQueue>[] = [];

  constructor(private readonly redis: RedisService) {
    for (const queueName of Object.values(JobQueue)) {
      const queue = new Queue(queueName, {
        connection: this.redis.getIORedis(),
      });

      queue.on('error', (error) => {
        this.#logger.error(`Queue ${queueName} error: ${error}`);
      });

      this.#queues.set(queueName, queue);
    }
  }

  /**
   * Returns the queue with the given name.
   */
  get<T extends JobQueue>(queue: T): Queue<JobPayload[T]> {
    return this.#queues.get(queue) as Queue<JobPayload[T]>;
  }

  /**
   * Starts a worker for the given queue.
   */
  startWorker<ResultType, NameType extends JobQueue>(
    queue: NameType,
    handler: Processor<JobPayload[NameType], ResultType, NameType>,
  ): Worker<JobPayload[NameType], ResultType, NameType> {
    const worker = new Worker(queue, handler, {
      connection: this.redis.getIORedis(),
      concurrency: 20,
      removeOnComplete: { count: 100, age: 1000 * 60 * 60 * 24 /* 1 day */ },
      removeOnFail: { count: 500, age: 1000 * 60 * 60 * 24 * 7 /* 1 week */ },
    }) as Worker<JobPayload[NameType], ResultType, NameType>;

    worker.on('error', (error) => {
      this.#logger.error(`Worker ${queue} error: ${error}`);
    });

    worker.on('failed', (job, jobError) => {
      this.#logger.error(`Worker ${queue} job ${job?.id} failed:`, jobError);
    });

    this.#workers.push(worker);

    return worker;
  }

  /**
   * Stops all workers when Nest is shutting down.
   */
  async onApplicationShutdown() {
    for (const worker of this.#workers) {
      this.#logger.debug(`Closing worker for queue ${worker.name}`);
      await worker.close();
    }

    this.#logger.log('Closed all job queue workers');
  }
}

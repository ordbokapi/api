import { Injectable, Logger } from '@nestjs/common';
import { JobQueueService, JobQueue } from './job-queue.service';
import {
  UibApiService,
  UiBDictionary,
  UibRedisService,
  convertRawArticleMetadata,
  ArticleMetadata,
  RedisService,
  isProd,
} from 'ordbokapi-common';

/**
 * A service which works the job queues to keep the article data in sync with
 * the UiB API.
 */
@Injectable()
export class ArticleSyncService {
  constructor(
    private readonly redis: RedisService,
    private readonly data: UibRedisService,
    private readonly queues: JobQueueService,
    private readonly api: UibApiService,
  ) {}

  #logger = new Logger(ArticleSyncService.name);

  /**
   * Fetches the article list from the UiB API and queues individual article
   * fetch jobs.
   * @param dictionary The dictionary to fetch the article list for. If not
   * provided, the article list for all dictionaries will be fetched.
   */
  async #syncArticles(dictionary: UiBDictionary): Promise<void> {
    const prod = isProd();

    this.#logger.verbose(`[${dictionary}] Fetching article list`);

    const articleList = await this.api.fetchArticleList(dictionary);

    this.#logger.verbose(
      `[${dictionary}] ${articleList.length} articles available from UiB API`,
    );

    const existingMetadata = await this.data.getAllArticleMetadata(dictionary);

    this.#logger.verbose(
      `[${dictionary}] ${existingMetadata.size} existing articles in DB`,
    );

    const queue = this.queues.get(JobQueue.FetchArticle);
    const jobs = (await queue.getJobs(['delayed', 'wait', 'active'])).reduce(
      (jobs, job) => {
        if (job.data.dictionary === dictionary) {
          jobs.add(job.data.metadata.articleId);
        }
        return jobs;
      },
      new Set<number>(),
    );

    this.#logger.verbose(
      `[${dictionary}] Found ${jobs.size} active article fetch jobs`,
    );

    const idSet: Set<number> = new Set();
    let queuedTotal = 0;
    let index = -1;

    while (articleList.length > 0) {
      index++;

      const rawMetadata = articleList.pop()!;
      const metadata = convertRawArticleMetadata(rawMetadata);
      const existing = existingMetadata.get(metadata.articleId);
      idSet.add(metadata.articleId);

      !prod &&
        process.stdout.write(
          `[${dictionary}] Processing article ${index + 1} of ${articleList.length}\r`,
        );

      if (
        existing &&
        existing.revision === metadata.revision &&
        Math.abs(existing.updatedAt.getTime() - metadata.updatedAt.getTime()) <
          1000 // allow for 1 second difference due to millisecond precision
      ) {
        continue;
      }

      if (jobs.has(metadata.articleId)) {
        continue;
      }

      await queue.add(JobQueue.FetchArticle, {
        dictionary,
        metadata,
      });

      queuedTotal++;

      this.#logger.verbose(
        `[${dictionary}] Queued article fetch for ${metadata.articleId} (${metadata.primaryLemma})`,
      );
    }

    // remove articles that no longer exist
    for (const [id, metadata] of existingMetadata) {
      if (idSet.has(id)) {
        continue;
      }

      // for now just warn about this, we might want to remove the article later
      this.#logger.warn(
        `[${dictionary}] Article ${id} (${metadata.primaryLemma}) no longer exists`,
      );
    }

    this.#logger.log(
      `[${dictionary}] Queued ${queuedTotal} article fetch jobs`,
    );
  }

  /**
   * Fetches an article from the UiB API and updates the article data in Redis.
   * @param dictionary The dictionary to fetch the article for.
   * @param metadata The article metadata.
   */
  async #syncArticle(
    dictionary: UiBDictionary,
    metadata: ArticleMetadata,
  ): Promise<void> {
    this.#logger.verbose(
      `[${dictionary}] Fetching article ${metadata.articleId} (${metadata.primaryLemma})`,
    );

    const article = await this.api.fetchArticle(dictionary, metadata.articleId);

    this.#logger.verbose(
      `[${dictionary}] Fetched article ${metadata.articleId} (${metadata.primaryLemma})`,
    );

    await this.redis.tx((tx) => {
      this.data.setArticle(tx, dictionary, metadata.articleId, article);
      this.data.setArticleMetadata(tx, dictionary, metadata);
    });

    this.#logger.debug(
      `[${dictionary}] Synced article ${metadata.articleId} (${metadata.primaryLemma})`,
    );
  }

  /**
   * Fetches dictionary metadata (concepts, word classes, etc.) from the UiB API
   * and updates the dictionary data in Redis.
   * @param dictionary The dictionary to fetch the metadata for.
   */
  async #syncDictionaryMetadata(dictionary: UiBDictionary): Promise<void> {
    this.#logger.verbose(`[${dictionary}] Fetching dictionary metadata`);

    const concepts = await this.api.fetchConceptTable(dictionary);
    const wordClasses = await this.api.fetchWordClassList(dictionary);
    const wordSublasses = await this.api.fetchWordSubclassList(dictionary);

    this.#logger.verbose(`[${dictionary}] Fetched dictionary metadata`);

    await this.redis.tx((tx) => {
      this.data.setConcepts(tx, dictionary, concepts);
      this.data.setWordClasses(tx, dictionary, wordClasses);
      this.data.setWordSubclasses(tx, dictionary, wordSublasses);
    });

    this.#logger.debug(`[${dictionary}] Synced dictionary metadata`);
  }

  /**
   * Checks if any articles are in the database. If not, begins the intial
   * sync.
   */
  async #initialSync(): Promise<void> {
    for (const dictionary of Object.values(UiBDictionary)) {
      const metadata = await this.data.getAllArticleMetadata(dictionary);

      if (metadata.size === 0) {
        this.#logger.warn(`[${dictionary}] No articles in database`);

        await this.queues
          .get(JobQueue.FetchArticleList)
          .add(`sync-${dictionary}`, { dictionary });

        this.#logger.log(`[${dictionary}] Queued initial article fetch`);
      }

      const concepts = await this.data.getConcepts(dictionary);
      const wordClasses = await this.data.getWordClasses(dictionary);
      const wordSubclasses = await this.data.getWordSubclasses(dictionary);

      if (!concepts || !wordClasses || !wordSubclasses) {
        this.#logger.warn(`[${dictionary}] Missing dictionary metadata`);

        await this.queues
          .get(JobQueue.FetchDictionaryMetadata)
          .add(`sync-${dictionary}-metadata`, { dictionary });

        this.#logger.log(`[${dictionary}] Queued initial metadata fetch`);
      }
    }
  }

  /**
   * Starts the queue workers and schedules the recurring sync jobs.
   */
  async onApplicationBootstrap(): Promise<void> {
    this.queues.startWorker(
      JobQueue.FetchArticleList,
      async ({ data: { dictionary } }) => {
        await this.#syncArticles(dictionary);
      },
    );

    this.queues.startWorker(
      JobQueue.FetchArticle,
      async ({ data: { dictionary, metadata } }) => {
        await this.#syncArticle(dictionary, metadata);
      },
    );

    this.queues.startWorker(
      JobQueue.FetchDictionaryMetadata,
      async ({ data: { dictionary } }) => {
        await this.#syncDictionaryMetadata(dictionary);
      },
    );

    for (const dictionary of Object.values(UiBDictionary)) {
      await this.queues
        .get(JobQueue.FetchArticleList)
        .removeRepeatableByKey(`sync-${dictionary}`);

      await this.queues
        .get(JobQueue.FetchArticleList)
        .add(
          `sync-${dictionary}`,
          { dictionary },
          { repeat: { pattern: '0 2 * * *' } },
        );

      await this.queues
        .get(JobQueue.FetchArticleList)
        .removeRepeatableByKey(`sync-${dictionary}-metadata`);

      await this.queues
        .get(JobQueue.FetchDictionaryMetadata)
        .add(
          `sync-${dictionary}-metadata`,
          { dictionary },
          { repeat: { pattern: '0 2 * * *' } },
        );

      this.#logger.verbose(`[${dictionary}] Scheduled recurring sync`);
    }

    await this.#initialSync();

    this.#logger.log('Article sync service started');
  }
}

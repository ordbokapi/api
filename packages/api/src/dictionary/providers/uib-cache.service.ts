import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  UibRedisService,
  UibArticleIdentifier,
  UibDictionary,
  UibArticle,
  isUibArticleIdentifier,
  SearchOptions,
  FullSearchResult,
  RawConceptTable,
} from 'ordbokapi-common';
import { ICacheProvider } from '../../providers';
import * as crypto from 'crypto';

@Injectable()
export class UibCacheService {
  constructor(
    private readonly data: UibRedisService,
    @Inject('ICacheProvider') private readonly cache: ICacheProvider,
  ) {}

  #logger = new Logger(UibCacheService.name);

  #getArticleCacheKey(identifier: UibArticleIdentifier): string {
    return `article:${identifier.dictionary}:${identifier.id}`;
  }

  /**
   * Gets an article. If the article is not in the cache, it will be fetched
   * from the database and then stored in the cache.
   * @param identifier The identifier of the article to get.
   */
  async getArticle(
    identifier: UibArticleIdentifier,
  ): Promise<UibArticle | null>;
  /**
   * Gets an article. If the article is not in the cache, it will be fetched
   * from the database and then stored in the cache.
   * @param dictionary The dictionary of the article to get.
   * @param id The id of the article to get.
   */
  async getArticle(
    dictionary: UibDictionary,
    id: number,
  ): Promise<UibArticle | null>;
  async getArticle(
    identifierOrDictionary: UibArticleIdentifier | UibDictionary,
    id?: number,
  ): Promise<UibArticle | null> {
    const identifier = isUibArticleIdentifier(identifierOrDictionary)
      ? identifierOrDictionary
      : { dictionary: identifierOrDictionary, id: id! };

    const cacheKey = this.#getArticleCacheKey(identifier);
    const cached: UibArticle = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const article = await this.data.getArticle(identifier);

    if (!article) {
      return null;
    }

    await this.cache.set(cacheKey, article);
    return article;
  }

  /**
   * Caches an article. If the article is already in the cache, it will be
   * not be updated.
   * @param identifier The identifier of the article to cache.
   * @param article The article to cache.
   */
  async cacheArticle(
    identifier: UibArticleIdentifier,
    article: UibArticle,
  ): Promise<void> {
    const cacheKey = this.#getArticleCacheKey(identifier);
    const cached: UibArticle = await this.cache.get(cacheKey);

    if (cached) {
      return;
    }

    await this.cache.set(cacheKey, article);
  }

  #updateHashWithObject(obj: object, hash: crypto.Hash): crypto.Hash {
    // Create a hash of the object in such a way that the same object will
    // always produce the same hash, regardless of the order of the keys.

    // hash.update(JSON.stringify(obj)); // This is not good enough, because
    // the order of the keys matters.

    const keys = Object.keys(obj).sort() as Array<keyof typeof obj>;

    // do this recursively so that nested objects will also be sorted
    for (const key of keys) {
      hash.update(key);
      this.#updateHashWithObject(obj[key], hash);
    }

    return hash;
  }

  #getSearchCacheKey(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): string {
    const hash = crypto.createHash('sha1');

    hash.update(query);

    if (dictionary) {
      hash.update(dictionary);
    }

    if (options) {
      this.#updateHashWithObject(options, hash);
    }

    return `search:${hash.digest('hex')}`;
  }

  /**
   * Performs a search. If the search was already performed, the result will
   * be fetched from the cache. Otherwise, the search will be performed and
   * the result will be stored in the cache.
   */
  async search(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<FullSearchResult[]> {
    const cacheKey = this.#getSearchCacheKey(query, dictionary, options);
    const cached: UibArticleIdentifier[] = await this.cache.get(cacheKey);

    if (cached) {
      const articles = await Promise.all(
        cached.map(async (identifier): Promise<FullSearchResult | null> => {
          const data = await this.getArticle(identifier);

          if (!data) {
            return null;
          }

          return {
            ...identifier,
            data,
          };
        }),
      );

      return articles.filter((article): article is FullSearchResult =>
        Boolean(article),
      );
    }

    const { total, results } = await this.data.searchWithData(
      query,
      dictionary,
      options,
    );

    if (!total) {
      return [];
    }

    const array: FullSearchResult[] = [];

    for await (const result of results) {
      array.push(result);

      await this.cacheArticle(
        {
          dictionary: result.dictionary,
          id: result.id,
        },
        result.data,
      );
    }

    await this.cache.set(
      cacheKey,
      array.map((result) => ({
        dictionary: result.dictionary,
        id: result.id,
      })),
    );

    return array;
  }

  // #concepts: Map<UibDictionary, RawConceptTable> = new Map();
  #concepts: { [key in UibDictionary]?: RawConceptTable } = {};

  /**
   * Gets the concept table for all dictionaries when the application starts.
   */
  async onApplicationBootstrap() {
    const fetchConcepts = async (dictionary: UibDictionary) => {
      const table = await this.data.getConcepts(dictionary);

      if (!table) {
        this.#logger.error(
          `Failed to fetch concepts from Ordbøkene API for ${dictionary}.`,
        );
        setTimeout(() => fetchConcepts(dictionary), 30 * 1000);
        return;
      }

      this.#concepts[dictionary] = table;
    };

    for (const dictionary of Object.values(UibDictionary)) {
      fetchConcepts(dictionary);
    }
  }

  /**
   * Gets the concept table for the specified dictionary.
   * @param dictionary The dictionary to get the concept table for.
   */
  getConcepts(dictionary: UibDictionary): RawConceptTable {
    const cached = this.#concepts[dictionary];

    return (
      cached ?? {
        id: dictionary,
        name: dictionary,
        concepts: {},
      }
    );
  }

  /**
   * Gets the concept with the specified id from the specified dictionary.
   * @param dictionary The dictionary to get the concept from.
   * @param id The id of the concept to get.
   */
  getConcept(
    dictionary: UibDictionary,
    id: string,
  ): RawConceptTable['concepts'][string] | null {
    return this.getConcepts(dictionary).concepts[id] ?? null;
  }
}

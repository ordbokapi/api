// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This file is part of Ordbok API.
//
// Ordbok API is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  UibDbService,
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
    private readonly data: UibDbService,
    @Inject('ICacheProvider') private readonly cache: ICacheProvider,
  ) {}

  #logger = new Logger(UibCacheService.name);

  #getArticleCacheKey(identifier: UibArticleIdentifier): string {
    return `article:${identifier.dictionary}:${identifier.id}`;
  }

  #pendingArticles: Map<
    UibDictionary,
    Array<{
      id: number;
      resolve: (article: UibArticle | null) => void;
      reject: (err: unknown) => void;
    }>
  > | null = null;

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
    try {
      const cached: UibArticle = await this.cache.get(cacheKey);

      if (cached) {
        return cached;
      }
    } catch (error) {
      this.#logger.error(
        `Failed to retrieve cache for key: ${cacheKey}`,
        error,
      );
    }

    if (!this.#pendingArticles) {
      this.#pendingArticles = new Map();
      queueMicrotask(() => this.#flushArticles());
    }

    if (!this.#pendingArticles.has(identifier.dictionary)) {
      this.#pendingArticles.set(identifier.dictionary, []);
    }

    return new Promise<UibArticle | null>((resolve, reject) => {
      this.#pendingArticles!.get(identifier.dictionary)!.push({
        id: identifier.id,
        resolve,
        reject,
      });
    });
  }

  async #flushArticles(): Promise<void> {
    const pending = this.#pendingArticles!;
    this.#pendingArticles = null;

    await Promise.all(
      [...pending].map(async ([dictionary, entries]) => {
        try {
          const ids = entries.map((e) => e.id);
          const map = await this.data.getArticlesFromDictionary(
            dictionary,
            ids,
          );

          for (const entry of entries) {
            const article = map.get(entry.id) ?? null;
            entry.resolve(article);
            if (article) {
              Promise.resolve(
                this.cache.set(
                  this.#getArticleCacheKey({ dictionary, id: entry.id }),
                  article,
                ),
              ).catch(() => {});
            }
          }
        } catch (err) {
          for (const entry of entries) {
            entry.reject(err);
          }
        }
      }),
    );
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

  /**
   * Fetch articles from a dictionary in batches to warm the cache.
   */
  async warmArticles(dictionary: UibDictionary, ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => this.getArticle(dictionary, id)));
  }

  #updateHashWithObject(obj: unknown, hash: crypto.Hash): crypto.Hash {
    // Create a hash of the object in such a way that the same object will
    // always produce the same hash, regardless of the order of the keys.

    if (obj === null || obj === undefined) {
      hash.update('null');
      return hash;
    }

    if (typeof obj !== 'object') {
      hash.update(String(obj));
      return hash;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.#updateHashWithObject(item, hash);
      }
      return hash;
    }

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
   * Performs a search, returning only identifiers.
   */
  async searchIdentifiers(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<UibArticleIdentifier[]> {
    const cacheKey = this.#getSearchCacheKey(query, dictionary, options);
    const cached: UibArticleIdentifier[] = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const { total, results } = await this.data.search(
      query,
      dictionary,
      options,
    );

    if (!total) {
      return [];
    }

    const identifiers = Array.from(results);

    await this.cache.set(cacheKey, identifiers);

    return identifiers;
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
      // Batch fetches by dictionary.
      const byDict = new Map<string, UibArticleIdentifier[]>();
      for (const identifier of cached) {
        const list = byDict.get(identifier.dictionary) ?? [];
        list.push(identifier);
        byDict.set(identifier.dictionary, list);
      }

      const articles: FullSearchResult[] = [];
      await Promise.all(
        Array.from(byDict.entries()).map(async ([dict, identifiers]) => {
          const ids = identifiers.map((i) => i.id);
          const map = await this.data.getArticlesFromDictionary(
            dict as any,
            ids,
          );
          for (const identifier of identifiers) {
            const data = map.get(identifier.id);
            if (data) {
              articles.push({ ...identifier, data });
            }
          }
        }),
      );

      return articles;
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

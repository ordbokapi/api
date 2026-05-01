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

import { Injectable } from '@nestjs/common';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { DatabaseService } from './database.service';
import { MeilisearchService, MeiliSearchResults } from './meilisearch.service';
import * as schema from '../db/schema';
import {
  UibDictionary,
  RawConceptTable,
  RawWordClassList,
  RawWordSubclassList,
  UibArticleIdentifier,
  UibArticle,
  DeferredIterable,
  addUibArticleMetadata,
  RawArticle,
} from '../types';

/**
 * Search results.
 */
export interface SearchResults<T> {
  total: number;
  results: DeferredIterable<T>;
}

/**
 * Search result with an identifier and the article data.
 */
export interface FullSearchResult extends UibArticleIdentifier {
  data: UibArticle;
}

/**
 * Lightweight search result with identifier and lemma info from Meilisearch.
 */
export interface LightSearchResult extends UibArticleIdentifier {
  lemmas: string[];
}

/**
 * Search options.
 */
export interface SearchOptions {
  LIMIT?: { from: number; size: number };
  filter?: string;
}

/**
 * Provides read access to article data stored in PostgreSQL and search via
 * Meilisearch.
 */
@Injectable()
export class UibDbService {
  constructor(
    private readonly database: DatabaseService,
    private readonly meili: MeilisearchService,
  ) {}

  // #region Article data

  async getArticle(
    dictionary: UibDictionary,
    articleId: number,
  ): Promise<UibArticle | null>;
  async getArticle(
    identifier: UibArticleIdentifier,
  ): Promise<UibArticle | null>;
  async getArticle(
    dictionaryOrIdentifier: UibDictionary | UibArticleIdentifier,
    articleId?: number,
  ): Promise<UibArticle | null> {
    let dict: UibDictionary;
    let id: number;

    if (typeof dictionaryOrIdentifier === 'string') {
      dict = dictionaryOrIdentifier;
      id = articleId!;
    } else {
      dict = dictionaryOrIdentifier.dictionary;
      id = dictionaryOrIdentifier.id;
    }

    const row = await this.database.db
      .select({ data: schema.articles.data })
      .from(schema.articles)
      .where(
        and(eq(schema.articles.dictionary, dict), eq(schema.articles.id, id)),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!row) {
      return null;
    }

    const article = row.data as RawArticle;
    return addUibArticleMetadata(article);
  }

  async getArticlesFromDictionary(
    dictionary: UibDictionary,
    articleIds: number[],
  ): Promise<Map<number, UibArticle>> {
    if (articleIds.length === 0) {
      return new Map();
    }

    const rows = await this.database.db
      .select({ id: schema.articles.id, data: schema.articles.data })
      .from(schema.articles)
      .where(
        and(
          eq(schema.articles.dictionary, dictionary),
          inArray(schema.articles.id, articleIds),
        ),
      );

    const map = new Map<number, UibArticle>();
    for (const row of rows) {
      map.set(row.id, addUibArticleMetadata(row.data as RawArticle));
    }
    return map;
  }

  async getRandomArticle(
    dictionary: UibDictionary,
  ): Promise<UibArticle | null> {
    const row = await this.database.db
      .select({ id: schema.articles.id, data: schema.articles.data })
      .from(schema.articles)
      .where(
        and(
          eq(schema.articles.dictionary, dictionary),
          sql`${schema.articles.id} >= (
            SELECT floor(random() * (max(id) - min(id) + 1) + min(id))::int
            FROM ${schema.articles} WHERE dictionary = ${dictionary}
          )`,
        ),
      )
      .orderBy(schema.articles.id)
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!row) {
      return null;
    }

    return addUibArticleMetadata(row.data as RawArticle);
  }

  // #endregion

  // #region Dictionary metadata

  async getConcepts(
    dictionary: UibDictionary,
  ): Promise<RawConceptTable | null> {
    return this.#getMetadata(
      dictionary,
      'concepts',
    ) as Promise<RawConceptTable | null>;
  }

  async getWordClasses(
    dictionary: UibDictionary,
  ): Promise<RawWordClassList | null> {
    return this.#getMetadata(
      dictionary,
      'word_classes',
    ) as Promise<RawWordClassList | null>;
  }

  async getWordSubclasses(
    dictionary: UibDictionary,
  ): Promise<RawWordSubclassList | null> {
    return this.#getMetadata(
      dictionary,
      'word_subclasses',
    ) as Promise<RawWordSubclassList | null>;
  }

  async #getMetadata(
    dictionary: UibDictionary,
    key: string,
  ): Promise<unknown | null> {
    const row = await this.database.db
      .select({ data: schema.dictionaryMetadata.data })
      .from(schema.dictionaryMetadata)
      .where(
        and(
          eq(schema.dictionaryMetadata.dictionary, dictionary),
          eq(schema.dictionaryMetadata.key, key),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);

    return row?.data ?? null;
  }

  // #endregion

  // #region Search

  async search(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<SearchResults<UibArticleIdentifier>> {
    const limit = options?.LIMIT?.size ?? 20;
    const offset = options?.LIMIT?.from ?? 0;
    const filter = options?.filter;

    let result: MeiliSearchResults;

    if (dictionary) {
      result = await this.meili.search(dictionary, query, {
        limit,
        offset,
        filter,
      });
    } else {
      result = await this.meili.multiSearch(
        Object.values(UibDictionary),
        query,
        { limit, offset, filter },
      );
    }

    const identifiers: UibArticleIdentifier[] = result.hits.map((hit) => ({
      dictionary: hit.dictionary as UibDictionary,
      id: hit.article_id,
    }));

    return {
      total: result.total,
      results: new DeferredIterable(identifiers),
    };
  }

  /**
   * Lightweight search that returns lemma info directly from Meilisearch
   * without fetching full article data from PostgreSQL.
   */
  async searchLight(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<LightSearchResult[]> {
    const limit = options?.LIMIT?.size ?? 20;
    const offset = options?.LIMIT?.from ?? 0;
    const filter = options?.filter;

    let result: MeiliSearchResults;

    if (dictionary) {
      result = await this.meili.search(dictionary, query, {
        limit,
        offset,
        filter,
      });
    } else {
      result = await this.meili.multiSearch(
        Object.values(UibDictionary),
        query,
        { limit, offset, filter },
      );
    }

    return result.hits.map((hit) => ({
      dictionary: hit.dictionary as UibDictionary,
      id: hit.article_id,
      lemmas: hit.lemmas,
    }));
  }

  /**
   * Batch multiple lightweight searches into a single Meilisearch round-trip.
   * Returns results in the same order as the input queries.
   */
  async batchSearchLight(
    queries: Array<{
      query: string;
      dictionary: UibDictionary;
      options?: SearchOptions;
    }>,
  ): Promise<LightSearchResult[][]> {
    if (queries.length === 0) {
      return [];
    }

    const meiliQueries = queries.map((q) => ({
      dictionary: q.dictionary,
      query: q.query,
      filter: q.options?.filter,
      limit: q.options?.LIMIT?.size ?? 20,
      offset: q.options?.LIMIT?.from ?? 0,
    }));

    const results = await this.meili.batchSearch(meiliQueries);

    return results.map((result) =>
      result.hits.map((hit) => ({
        dictionary: hit.dictionary as UibDictionary,
        id: hit.article_id,
        lemmas: hit.lemmas,
      })),
    );
  }

  async searchWithData(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<SearchResults<FullSearchResult>> {
    const searchResult = await this.search(query, dictionary, options);
    return this.fetchArticles(searchResult);
  }

  async fetchArticles(
    searchResult: SearchResults<UibArticleIdentifier>,
  ): Promise<SearchResults<FullSearchResult>> {
    const ids = Array.from(searchResult.results);

    if (ids.length === 0) {
      return { total: 0, results: new DeferredIterable([]) };
    }

    // Group IDs by dictionary for batch fetching.
    const byDict = new Map<UibDictionary, number[]>();
    for (const id of ids) {
      const arr = byDict.get(id.dictionary) ?? [];
      arr.push(id.id);
      byDict.set(id.dictionary, arr);
    }

    // Batch fetch per dictionary.
    const articleMaps = await Promise.all(
      Array.from(byDict.entries()).map(([dict, articleIds]) =>
        this.getArticlesFromDictionary(dict, articleIds),
      ),
    );

    // Merge maps.
    const merged = new Map<string, UibArticle>();
    for (const [i, [dict]] of Array.from(byDict.entries()).entries()) {
      for (const [articleId, article] of articleMaps[i]) {
        merged.set(`${dict}:${articleId}`, article);
      }
    }

    const articles: FullSearchResult[] = [];
    for (const id of ids) {
      const data = merged.get(`${id.dictionary}:${id.id}`);
      if (data) {
        articles.push({ id: id.id, dictionary: id.dictionary, data });
      }
    }

    return {
      total: searchResult.total,
      results: new DeferredIterable(articles),
    };
  }

  // #endregion
}

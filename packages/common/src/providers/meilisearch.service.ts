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

import * as http from 'node:http';
import * as https from 'node:https';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Meilisearch } from 'meilisearch';
import { UibDictionary } from '../types';

export interface MeiliSearchHit {
  id: string;
  article_id: number;
  dictionary: string;
  lemmas: string[];
  suggest: string[];
  [key: string]: unknown;
}

export interface MeiliSearchResults {
  total: number;
  hits: MeiliSearchHit[];
}

export interface BibliographyHit {
  id: number;
  code: string;
  author: string;
  title: string;
  year: string;
}

export interface BibliographySearchResults {
  total: number;
  hits: BibliographyHit[];
}

export interface PlaceHit {
  id: number;
  place_name: string;
  place_name_full: string;
  place_type: string;
  parent_id: number | null;
  municipality_nr: string | null;
}

export interface PlaceSearchResults {
  total: number;
  hits: PlaceHit[];
}

export interface MeiliSearchFacetResults extends MeiliSearchResults {
  facetDistribution?: Record<string, Record<string, number>>;
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  #client!: Meilisearch;
  #logger = new Logger(MeilisearchService.name);
  #indexCounts = new Map<string, { count: number; expiry: number }>();
  #httpAgent = new http.Agent({ keepAlive: true });
  #httpsAgent = new https.Agent({ keepAlive: true });

  #httpClient = async (
    url: string | URL | Request,
    init?: RequestInit,
  ): Promise<unknown> => {
    const urlStr = String(url instanceof Request ? url.url : url);
    const method = init?.method ?? 'GET';
    const headers: Record<string, string> = {};
    if (init?.headers) {
      new Headers(init.headers).forEach((v, k) => {
        headers[k] = v;
      });
    }
    const body = init?.body as string | undefined;
    const isHttps = urlStr.startsWith('https');
    const agent = isHttps ? this.#httpsAgent : this.#httpAgent;

    return new Promise((resolve, reject) => {
      const req = (isHttps ? https : http).request(
        urlStr,
        { method, headers, agent },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          });
        },
      );
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  };

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('MEILI_URL') || 'http://127.0.0.1:7700';
    const key = this.config.get<string>('MEILI_API_KEY') || undefined;

    this.#client = new Meilisearch({
      host: url,
      apiKey: key,
      httpClient: this.#httpClient,
    });

    const health = await this.#client.health();
    this.#logger.log(`Meilisearch is ${health.status}`);
  }

  #indexName(dictionary: UibDictionary): string {
    return `articles-${dictionary}`;
  }

  #getIndex(dictionary: UibDictionary) {
    return this.#client.index(this.#indexName(dictionary));
  }

  async #getIndexCount(indexUid: string): Promise<number> {
    const cached = this.#indexCounts.get(indexUid);
    if (cached && cached.expiry > Date.now()) {
      return cached.count;
    }
    const stats = await this.#client.index(indexUid).getStats();
    this.#indexCounts.set(indexUid, {
      count: stats.numberOfDocuments,
      expiry: Date.now() + 5 * 60_000,
    });
    return stats.numberOfDocuments;
  }

  /**
   * Without a search term, paginate per-index to avoid O(offset) cost of
   * federated search.
   */
  async #sequentialSearch(
    dictionaries: UibDictionary[],
    options: {
      facets?: string[];
      limit: number;
      offset: number;
    },
  ): Promise<MeiliSearchFacetResults> {
    const indexUids = dictionaries.map((d) => this.#indexName(d));
    const counts = await Promise.all(
      indexUids.map((uid) => this.#getIndexCount(uid)),
    );
    const totalCount = counts.reduce((sum, c) => sum + c, 0);

    let remaining = options.offset;
    let startIndex = 0;

    for (let i = 0; i < counts.length; i++) {
      if (remaining < counts[i]) {
        startIndex = i;
        break;
      }
      remaining -= counts[i];
      if (i === counts.length - 1) {
        startIndex = i;
        remaining = counts[i];
      }
    }

    const hits: MeiliSearchHit[] = [];
    let localOffset = remaining;
    let needed = options.limit;
    let facetDistribution: Record<string, Record<string, number>> | undefined;

    for (let i = startIndex; i < indexUids.length && needed > 0; i++) {
      const localLimit = Math.min(needed, counts[i] - localOffset);

      if (localLimit <= 0) {
        localOffset = 0;
        continue;
      }

      const result = await this.#client.index(indexUids[i]).search('', {
        limit: localLimit,
        offset: localOffset,
        ...(options.facets?.length ? { facets: options.facets } : undefined),
      });

      hits.push(...(result.hits as MeiliSearchHit[]));

      if (options.facets?.length && result.facetDistribution) {
        if (!facetDistribution) {
          facetDistribution = result.facetDistribution;
        } else {
          for (const [facet, values] of Object.entries(
            result.facetDistribution,
          )) {
            if (!facetDistribution[facet]) {
              facetDistribution[facet] = values;
            } else {
              for (const [val, count] of Object.entries(values)) {
                facetDistribution[facet][val] =
                  (facetDistribution[facet][val] ?? 0) + count;
              }
            }
          }
        }
      }

      needed -= result.hits.length;
      localOffset = 0;
    }

    if (options.facets?.length && !facetDistribution) {
      facetDistribution = {};
    }

    if (options.facets?.length) {
      const missingIndexes = indexUids.filter(
        (_, i) =>
          i < startIndex ||
          i >
            startIndex +
              (options.limit > counts[startIndex] - remaining ? 1 : 0),
      );

      if (missingIndexes.length > 0) {
        const facetResults = await Promise.all(
          missingIndexes.map((uid) =>
            this.#client
              .index(uid)
              .search('', { limit: 0, facets: options.facets }),
          ),
        );

        for (const r of facetResults) {
          if (r.facetDistribution) {
            for (const [facet, values] of Object.entries(r.facetDistribution)) {
              if (!facetDistribution![facet]) {
                facetDistribution![facet] = values;
              } else {
                for (const [val, count] of Object.entries(values)) {
                  facetDistribution![facet][val] =
                    (facetDistribution![facet][val] ?? 0) + count;
                }
              }
            }
          }
        }
      }
    }

    return { total: totalCount, hits, facetDistribution };
  }

  async search(
    dictionary: UibDictionary,
    query: string,
    options?: {
      filter?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<MeiliSearchResults> {
    const index = this.#getIndex(dictionary);

    const result = await index.search(query, {
      filter: options?.filter,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });

    return {
      total: result.estimatedTotalHits ?? result.hits.length,
      hits: result.hits as MeiliSearchHit[],
    };
  }

  async multiSearch(
    dictionaries: UibDictionary[],
    query: string,
    options?: {
      filter?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<MeiliSearchResults> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    if (!query && !options?.filter) {
      const result = await this.#sequentialSearch(dictionaries, {
        limit,
        offset,
      });
      return { total: result.total, hits: result.hits };
    }

    const queries = dictionaries.map((dict) => ({
      indexUid: this.#indexName(dict),
      q: query,
      filter: options?.filter,
    }));

    const result = await this.#client.multiSearch({
      federation: { limit, offset },
      queries,
    });

    return {
      total: result.estimatedTotalHits ?? result.hits.length,
      hits: result.hits as MeiliSearchHit[],
    };
  }

  async searchWithFacets(
    dictionaries: UibDictionary[],
    query: string,
    options?: {
      filter?: string;
      sort?: string[];
      facets?: string[];
      limit?: number;
      offset?: number;
    },
  ): Promise<MeiliSearchFacetResults> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    if (
      !query &&
      !options?.filter &&
      (!options?.sort || options.sort.length === 0)
    ) {
      return this.#sequentialSearch(dictionaries, {
        facets: options?.facets,
        limit,
        offset,
      });
    }

    const facetsByIndex: Record<string, string[]> = {};
    const queries = dictionaries.map((dict) => {
      const indexUid = this.#indexName(dict);
      if (options?.facets?.length) {
        facetsByIndex[indexUid] = options.facets;
      }
      return {
        indexUid,
        q: query,
        filter: options?.filter,
        sort: options?.sort,
      };
    });

    const result = await this.#client.multiSearch({
      federation: {
        limit,
        offset,
        ...(Object.keys(facetsByIndex).length > 0
          ? { facetsByIndex, mergeFacets: {} }
          : undefined),
      },
      queries,
    });

    return {
      total: result.estimatedTotalHits ?? result.hits.length,
      hits: result.hits as MeiliSearchHit[],
      facetDistribution: result.facetDistribution ?? undefined,
    };
  }

  #pendingBatch:
    | {
        queries: Array<{
          indexUid: string;
          q: string;
          filter?: string;
          limit: number;
          offset: number;
        }>;
        resolve: (results: MeiliSearchResults[]) => void;
        reject: (err: unknown) => void;
        startIndex: number;
        count: number;
      }[]
    | null = null;

  /**
   * Execute multiple search queries in a single HTTP request.
   */
  async batchSearch(
    queries: Array<{
      dictionary: UibDictionary;
      query: string;
      filter?: string;
      limit?: number;
      offset?: number;
    }>,
  ): Promise<MeiliSearchResults[]> {
    if (queries.length === 0) {
      return [];
    }

    const meiliQueries = queries.map((q) => ({
      indexUid: this.#indexName(q.dictionary),
      q: q.query,
      filter: q.filter,
      limit: q.limit ?? 20,
      offset: q.offset ?? 0,
    }));

    if (!this.#pendingBatch) {
      this.#pendingBatch = [];
      queueMicrotask(() => this.#flushBatch());
    }

    const startIndex = this.#pendingBatch.reduce(
      (sum, entry) => sum + entry.queries.length,
      0,
    );

    return new Promise<MeiliSearchResults[]>((resolve, reject) => {
      this.#pendingBatch!.push({
        queries: meiliQueries,
        resolve,
        reject,
        startIndex,
        count: meiliQueries.length,
      });
    });
  }

  async #flushBatch(): Promise<void> {
    const batch = this.#pendingBatch!;
    this.#pendingBatch = null;

    const allQueries = batch.flatMap((entry) => entry.queries);

    try {
      const result = await this.#client.multiSearch({ queries: allQueries });

      for (const entry of batch) {
        const slice = result.results
          .slice(entry.startIndex, entry.startIndex + entry.count)
          .map((r) => ({
            total: r.estimatedTotalHits ?? r.hits.length,
            hits: r.hits as MeiliSearchHit[],
          }));
        entry.resolve(slice);
      }
    } catch (err) {
      for (const entry of batch) {
        entry.reject(err);
      }
    }
  }

  async searchBibliography(
    query: string,
    options?: {
      filter?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<BibliographySearchResults> {
    const index = this.#client.index('bibliography');

    const result = await index.search(query, {
      filter: options?.filter,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });

    return {
      total: result.estimatedTotalHits ?? result.hits.length,
      hits: result.hits as BibliographyHit[],
    };
  }

  async searchPlaces(
    query: string,
    options?: {
      filter?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<PlaceSearchResults> {
    const index = this.#client.index('places');

    const result = await index.search(query, {
      filter: options?.filter,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });

    return {
      total: result.estimatedTotalHits ?? result.hits.length,
      hits: result.hits as PlaceHit[],
    };
  }
}

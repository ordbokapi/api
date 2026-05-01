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

@Injectable()
export class MeilisearchService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  #client!: Meilisearch;
  #logger = new Logger(MeilisearchService.name);
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
    const queries = dictionaries.map((dict) => ({
      indexUid: this.#indexName(dict),
      q: query,
      filter: options?.filter,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    }));

    const result = await this.#client.multiSearch({ queries });

    const allHits: MeiliSearchHit[] = [];
    let total = 0;

    for (const r of result.results) {
      total += r.estimatedTotalHits ?? r.hits.length;
      allHits.push(...(r.hits as MeiliSearchHit[]));
    }

    return { total, hits: allHits };
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
}

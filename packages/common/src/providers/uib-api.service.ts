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
import {
  type UibDictionary,
  type RawArticleList,
  type RawWordClassList,
  type RawWordSubclassList,
  type RawConceptTable,
  RawArticle,
} from '../types';

/**
 * A service for interacting with the UiB API.
 */
@Injectable()
export class UibApiService {
  readonly #baseUrl = 'https://ord.uib.no/';

  /**
   * Internal method to return JSON from the given URL.
   */
  async #getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Fetches the list of articles for the given dictionary.
   */
  async fetchArticleList(dictionary: UibDictionary): Promise<RawArticleList> {
    return this.#getJson(`${this.#baseUrl}${dictionary}/fil/article.json`);
  }

  /**
   * Fetches the word class list for the given dictionary.
   */
  async fetchWordClassList(
    dictionary: UibDictionary,
  ): Promise<RawWordClassList> {
    return this.#getJson(`${this.#baseUrl}${dictionary}/fil/word_class.json`);
  }

  /**
   * Fetches the word subclass list for the given dictionary.
   */
  async fetchWordSubclassList(
    dictionary: UibDictionary,
  ): Promise<RawWordSubclassList> {
    return this.#getJson(
      `${this.#baseUrl}${dictionary}/fil/sub_word_class.json`,
    );
  }

  /**
   * Fetches the article with the given ID from the given dictionary.
   */
  async fetchArticle(
    dictionary: UibDictionary,
    articleId: number,
  ): Promise<RawArticle> {
    return this.#getJson(
      `${this.#baseUrl}${dictionary}/article/${articleId}.json`,
    );
  }

  /**
   * Fetches the concept table for the given dictionary.
   */
  async fetchConceptTable(dictionary: UibDictionary): Promise<RawConceptTable> {
    return this.#getJson(`${this.#baseUrl}${dictionary}/concepts.json`);
  }
}

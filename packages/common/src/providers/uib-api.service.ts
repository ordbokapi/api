import { Injectable } from '@nestjs/common';
import {
  type UiBDictionary,
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
  async fetchArticleList(dictionary: UiBDictionary): Promise<RawArticleList> {
    return this.#getJson(`${this.#baseUrl}${dictionary}/fil/article.json`);
  }

  /**
   * Fetches the word class list for the given dictionary.
   */
  async fetchWordClassList(
    dictionary: UiBDictionary,
  ): Promise<RawWordClassList> {
    return this.#getJson(`${this.#baseUrl}${dictionary}/fil/word_class.json`);
  }

  /**
   * Fetches the word subclass list for the given dictionary.
   */
  async fetchWordSubclassList(
    dictionary: UiBDictionary,
  ): Promise<RawWordSubclassList> {
    return this.#getJson(
      `${this.#baseUrl}${dictionary}/fil/sub_word_class.json`,
    );
  }

  /**
   * Fetches the article with the given ID from the given dictionary.
   */
  async fetchArticle(
    dictionary: UiBDictionary,
    articleId: number,
  ): Promise<RawArticle> {
    return this.#getJson(
      `${this.#baseUrl}${dictionary}/article/${articleId}.json`,
    );
  }

  /**
   * Fetches the concept table for the given dictionary.
   */
  async fetchConceptTable(dictionary: UiBDictionary): Promise<RawConceptTable> {
    return this.#getJson(`${this.#baseUrl}${dictionary}/concepts.json`);
  }
}

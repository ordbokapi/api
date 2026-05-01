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

import { RawArticle, UibDictionary } from './uib-api.types';
import { isObject } from '../utils';

/**
 * Article metadata.
 */
export interface ArticleMetadata {
  /** The ID of the article. */
  articleId: number;

  /** The primary lemma of the article. */
  primaryLemma: string;

  /** The latest revision number of the article. */
  revision: number;

  /** The update timestamp of the article. */
  updatedAt: Date;
}

/**
 * Article metadata map.
 */
export type ArticleMetadataMap = Map<
  number,
  Omit<ArticleMetadata, 'articleId'>
>;

/**
 * FT index names for articles.
 */
export enum ArticleIndex {
  /** The index for article lemmas. */
  Lemma = 'lemmas',

  /** The index for suggestion terms for a given article. */
  Suggest = 'suggest',

  /** The index for article etymology text. */
  Etymology = 'etymology_text',

  /** The index for paradigm tags. */
  ParadigmTags = 'paradigm_tags',

  /** The index for inflection tags. */
  InflectionTags = 'inflection_tags',

  /** The index for inflection word forms. */
  Inflection = 'inflections',

  /** The index for split infinitive attributes. */
  SplitInfinitive = 'has_split_inf',
}

/**
 * Identifies a particular article in the database.
 */
export interface UibArticleIdentifier {
  /** The dictionary ID. */
  dictionary: UibDictionary;

  /** The article ID. */
  id: number;
}

/**
 * Returns whether or not the given value is a UiB article identifier.
 */
export function isUibArticleIdentifier(
  value: unknown,
): value is UibArticleIdentifier {
  return (
    isObject(value) &&
    'dictionary' in value &&
    typeof value.dictionary === 'string' &&
    Object.values(UibDictionary).includes(value.dictionary as UibDictionary) &&
    'id' in value &&
    typeof value.id === 'number'
  );
}

/**
 * The format of article data as stored in the database.
 */
export interface UibArticle extends RawArticle {
  /** Additional metadata used for indexing and other purposes. */
  __ordbokapi__: UibArticleMetadata;
}

/**
 * Returns whether or not the given article is a processed UiB article.
 */
export function isUibArticle(article: RawArticle): article is UibArticle {
  return '__ordbokapi__' in article;
}

/**
 * Given a raw article, returns the article with additional metadata added.
 */
export function addUibArticleMetadata(article: RawArticle): UibArticle {
  if (isUibArticle(article)) {
    return article;
  }

  return {
    ...article,
    __ordbokapi__: {
      hasSplitInf: article.lemmas?.some((lemma) => lemma?.split_inf),
    },
  };
}

/**
 * Additional metadata used for indexing and other purposes.
 */
export interface UibArticleMetadata {
  /**
   * Whether or not any of the lemmas represent a verb with a split infinitive.
   */
  hasSplitInf: boolean;
}

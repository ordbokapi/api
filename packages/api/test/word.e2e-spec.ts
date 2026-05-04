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

import { describe, it, expect } from 'vitest';
import { gql } from './e2e-app';

describe('word query', () => {
  it('returns word, dictionaries, and article stubs', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        word
        dictionaries
        articles { id dictionary }
      }
    }`);
    expect(data.word).toMatchSnapshot();
  });

  it('returns lemma details with id, meaning, and splitInfinitive', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles {
          id
          lemmas { id lemma meaning splitInfinitive }
        }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    expect(article.lemmas).toMatchSnapshot();
  });

  it('returns paradigm with mapped tags and inflections', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles {
          id
          lemmas {
            paradigms {
              id
              tags
              inflections { wordForm tags }
            }
          }
        }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    expect(article.lemmas[0].paradigms).toMatchSnapshot();
  });

  it('returns definitions with specific text content', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles {
          id
          definitions {
            id
            content { textContent }
            examples { textContent }
            subDefinitions {
              id
              content { textContent }
              examples { textContent }
            }
          }
        }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    expect(article.definitions).toMatchSnapshot();
  });

  it('returns rich content with article reference segments', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles {
          id
          definitions {
            content {
              textContent
              richContent { type content }
            }
          }
        }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    const allSegments = article.definitions
      .flatMap((d: any) => d.content)
      .flatMap((c: any) => c.richContent);
    const articleRef = allSegments.find(
      (s: any) => s.type === 'Article' && s.content === 'uvane',
    );
    expect(articleRef).toBeTruthy();
  });

  it('returns etymology with concept expansion', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles {
          id
          etymology { textContent richContent { type content } }
        }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    expect(article.etymology).toMatchSnapshot();
  });

  it('returns wordClass and gender for a noun', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles { id wordClass gender }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    expect(article).toMatchSnapshot();
  });

  it('returns phrases', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka]) {
        articles {
          id
          phrases { id dictionary lemmas { lemma } }
        }
      }
    }`);
    const article = data.word.articles.find((a: any) => a.id === 66381);
    expect(article.phrases).toMatchSnapshot();
  });

  it('returns null when word does not exist', async () => {
    const data = await gql(`{
      word(word: "xyzzy123456", dictionaries: [Bokmaalsordboka]) {
        word
      }
    }`);
    expect(data.word).toBeNull();
  });

  it('queries nynorsk dictionary', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Nynorskordboka]) {
        word
        dictionaries
        articles { id dictionary }
      }
    }`);
    expect(data.word).toMatchSnapshot();
  });

  it('finds inflected forms', async () => {
    const data = await gql(`{
      word(word: "vanene", dictionaries: [Bokmaalsordboka]) {
        word
        articles { id }
      }
    }`);
    expect(data.word).toBeTruthy();
    expect(data.word.articles.some((a: any) => a.id === 66381)).toBe(true);
  });
});

describe('cross-dictionary queries', () => {
  it('returns word present in both dictionaries', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [Bokmaalsordboka, Nynorskordboka]) {
        exact { word dictionaries articles { id dictionary } }
      }
    }`);
    const vane = data.suggestions.exact.find((w: any) => w.word === 'vane');
    expect(vane).toBeTruthy();
    expect(vane.dictionaries).toContain('Bokmaalsordboka');
    expect(vane.dictionaries).toContain('Nynorskordboka');
  });
});

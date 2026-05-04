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

describe('article query', () => {
  it('fetches a specific article with all scalar fields', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        id
        dictionary
        wordClass
        gender
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });

  it('returns full nested structure', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        lemmas {
          id lemma meaning splitInfinitive
          paradigms {
            id tags
            inflections { wordForm tags }
          }
        }
        definitions {
          id
          content { textContent }
          examples { textContent }
          subDefinitions { id content { textContent } }
        }
        etymology { textContent }
        phrases { id lemmas { lemma } }
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });

  it('returns relationships extracted from definitions', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        relationships {
          type
          article { id dictionary lemmas { lemma } }
        }
      }
    }`);
    expect(data.article.relationships).toMatchSnapshot();
  });

  it('returns null when article does not exist', async () => {
    const data = await gql(`{
      article(id: 999999999, dictionary: Bokmaalsordboka) { id }
    }`);
    expect(data.article).toBeNull();
  });

  it('returns neuter gender for vanemenneske', async () => {
    const data = await gql(`{
      article(id: 66391, dictionary: Bokmaalsordboka) {
        wordClass gender
        lemmas { lemma }
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });

  it('returns null gender for adjectives', async () => {
    const data = await gql(`{
      article(id: 66429, dictionary: Bokmaalsordboka) {
        wordClass gender
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });
});

describe('word class variety', () => {
  it('handles adjectives with comparative/superlative inflections', async () => {
    const data = await gql(`{
      article(id: 66429, dictionary: Bokmaalsordboka) {
        wordClass
        lemmas {
          lemma
          paradigms {
            tags inflections { wordForm tags }
          }
        }
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });

  it('handles verbs with multiple paradigms', async () => {
    const data = await gql(`{
      article(id: 67609, dictionary: Bokmaalsordboka) {
        wordClass
        lemmas {
          lemma splitInfinitive
          paradigms { id inflections { wordForm tags } }
        }
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });

  it('handles expressions', async () => {
    const data = await gql(`{
      article(id: 106188, dictionary: Bokmaalsordboka) {
        wordClass gender
        lemmas { lemma }
        definitions { content { textContent } }
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });

  it('handles nynorsk verb with split infinitive', async () => {
    const data = await gql(`{
      article(id: 88762, dictionary: Nynorskordboka) {
        wordClass
        lemmas { lemma splitInfinitive paradigms { id } }
      }
    }`);
    expect(data.article).toMatchSnapshot();
  });
});

describe('randomArticle query', () => {
  it('returns a valid article from the correct dictionary', async () => {
    const data = await gql(`{
      randomArticle(dictionary: Bokmaalsordboka) {
        id dictionary wordClass
        lemmas { lemma }
      }
    }`);
    expect(data.randomArticle).toBeTruthy();
    expect(data.randomArticle.dictionary).toBe('Bokmaalsordboka');
    expect(typeof data.randomArticle.id).toBe('number');
    expect(data.randomArticle.wordClass).toBeTruthy();
    expect(data.randomArticle.lemmas.length).toBeGreaterThan(0);
    expect(typeof data.randomArticle.lemmas[0].lemma).toBe('string');
  });

  it('returns nynorsk articles when requested', async () => {
    const data = await gql(`{
      randomArticle(dictionary: Nynorskordboka) {
        id dictionary
      }
    }`);
    expect(data.randomArticle.dictionary).toBe('Nynorskordboka');
  });
});

describe('rich content details', () => {
  it('renders explanation with concept expansion in definition', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        definitions {
          content { textContent richContent { type content } }
          subDefinitions {
            content { textContent richContent { type content } }
          }
        }
      }
    }`);
    expect(data.article.definitions).toMatchSnapshot();
  });

  it('renders examples with usage text', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        definitions {
          examples { textContent }
          subDefinitions {
            examples { textContent }
          }
        }
      }
    }`);
    expect(data.article.definitions).toMatchSnapshot();
  });

  it('renders etymology with multiple segments', async () => {
    const data = await gql(`{
      article(id: 49224, dictionary: Bokmaalsordboka) {
        etymology { textContent richContent { type content } }
      }
    }`);
    expect(data.article.etymology).toMatchSnapshot();
  });

  it('returns definition relationships with correct types', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        definitions {
          relationships { type article { id } }
          subDefinitions {
            relationships { type article { id } }
          }
        }
      }
    }`);
    expect(data.article.definitions).toMatchSnapshot();
  });
});

describe('edge cases', () => {
  it('handles article with empty inflection tags gracefully', async () => {
    const data = await gql(`{
      article(id: 66382, dictionary: Bokmaalsordboka) {
        lemmas {
          lemma
          paradigms {
            inflections { wordForm tags }
          }
        }
      }
    }`);
    expect(data.article.lemmas[0].lemma).toBe('vanebundet');
    for (const inf of data.article.lemmas[0].paradigms[0].inflections) {
      expect(inf.tags.length > 0 || inf.wordForm != null).toBe(true);
    }
  });

  it('handles article with multiple lemmas', async () => {
    const data = await gql(`{
      article(id: 88762, dictionary: Nynorskordboka) {
        lemmas { id lemma }
      }
    }`);
    expect(data.article.lemmas).toMatchSnapshot();
  });

  it('handles expression article queried as word', async () => {
    const data = await gql(`{
      word(word: "ha for vane", dictionaries: [Bokmaalsordboka]) {
        word articles { id wordClass }
      }
    }`);
    if (data.word) {
      const expr = data.word.articles.find((a: any) => a.id === 106188);
      if (expr) {
        expect(expr.wordClass).toBe('Uttrykk');
      }
    }
  });
});

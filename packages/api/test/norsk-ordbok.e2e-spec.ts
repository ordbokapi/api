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

describe('Norsk Ordbok article', () => {
  it('fetches a NO article with scalar fields', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        id dictionary wordClass gender
      }
    }`);
    expect(data.article).toEqual({
      id: 166337,
      dictionary: 'NorskOrdbok',
      wordClass: 'Substantiv',
      gender: 'Hankjoenn',
    });
  });

  it('returns lemmas with paradigms', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        lemmas {
          id lemma meaning splitInfinitive
          paradigms {
            id tags
            inflections { wordForm tags }
          }
        }
      }
    }`);
    expect(data.article.lemmas.length).toBeGreaterThan(0);
    expect(data.article.lemmas[0].lemma).toBe('merg');
    expect(
      data.article.lemmas[0].paradigms[0].inflections.length,
    ).toBeGreaterThan(0);
    expect(data.article).toMatchSnapshot();
  });

  it('returns etymology for NO articles', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        etymology { textContent richContent { type content } }
      }
    }`);
    expect(data.article.etymology.length).toBeGreaterThan(0);
    expect(data.article.etymology).toMatchSnapshot();
  });

  it('returns definitions with content and examples', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        definitions {
          id
          content { textContent }
          examples { textContent }
          subDefinitions { id content { textContent } }
        }
      }
    }`);
    expect(data.article.definitions.length).toBeGreaterThan(0);
    expect(data.article.definitions[0].content.length).toBeGreaterThan(0);
    expect(data.article).toMatchSnapshot();
  });
});

describe('Norsk Ordbok pronunciation', () => {
  it('returns pronunciation for articles with pronunciation data', async () => {
    const data = await gql(`{
      article(id: 354805, dictionary: NorskOrdbok) {
        lemmas { lemma }
        pronunciation { textContent }
      }
    }`);
    expect(data.article.pronunciation.length).toBeGreaterThan(0);
    expect(data.article.pronunciation[0].textContent).toBeTruthy();
    expect(data.article).toMatchSnapshot();
  });

  it('returns empty pronunciation for articles without it', async () => {
    const data = await gql(`{
      article(id: 194163, dictionary: NorskOrdbok) {
        pronunciation { textContent }
      }
    }`);
    expect(data.article.pronunciation).toEqual([]);
  });

  it('returns empty pronunciation for BM articles', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        pronunciation { textContent }
      }
    }`);
    expect(data.article.pronunciation).toEqual([]);
  });
});

describe('Norsk Ordbok dialect', () => {
  it('returns dialect forms with geographic sources', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        dialect {
          intro
          subcategories {
            label
            forms {
              form
              sources { place { id name type } visible }
            }
          }
        }
      }
    }`);
    expect(data.article.dialect.length).toBeGreaterThan(0);
    expect(data.article.dialect[0].subcategories.length).toBeGreaterThan(0);
    expect(
      data.article.dialect[0].subcategories[0].forms.length,
    ).toBeGreaterThan(0);
    const firstForm = data.article.dialect[0].subcategories[0].forms[0];
    expect(firstForm.form).toBeTruthy();
    expect(firstForm.sources.length).toBeGreaterThan(0);
    expect(firstForm.sources[0].place.name).toBeTruthy();
    expect(data.article.dialect).toMatchSnapshot();
  });

  it('returns empty dialect for BM articles', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        dialect { intro }
      }
    }`);
    expect(data.article.dialect).toEqual([]);
  });
});

describe('Norsk Ordbok written form', () => {
  it('returns written form variants with sources', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        writtenForm {
          intro
          variants {
            writtenForm
            sources { code id }
          }
        }
      }
    }`);
    expect(data.article.writtenForm.length).toBeGreaterThan(0);
    expect(data.article.writtenForm[0].variants.length).toBeGreaterThan(0);
    expect(data.article.writtenForm[0].variants[0].writtenForm).toBeTruthy();
    expect(data.article.writtenForm).toMatchSnapshot();
  });

  it('returns empty written form for BM articles', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        writtenForm { intro }
      }
    }`);
    expect(data.article.writtenForm).toEqual([]);
  });
});

describe('Norsk Ordbok older sources', () => {
  it('returns older source references', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        olderSources {
          code id
          spec { textContent }
        }
      }
    }`);
    expect(data.article.olderSources.length).toBeGreaterThan(0);
    expect(data.article.olderSources[0].code).toBeTruthy();
    expect(typeof data.article.olderSources[0].id).toBe('number');
    expect(data.article.olderSources).toMatchSnapshot();
  });

  it('returns empty older sources for BM articles', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        olderSources { code }
      }
    }`);
    expect(data.article.olderSources).toEqual([]);
  });
});

describe('Norsk Ordbok place references', () => {
  it('returns place references on definitions', async () => {
    const data = await gql(`{
      article(id: 194163, dictionary: NorskOrdbok) {
        definitions {
          id
          content { textContent }
          placeReferences {
            place { id name type }
            visible
          }
        }
      }
    }`);
    const defs = data.article.definitions;
    expect(defs.length).toBeGreaterThan(0);
    const withPlaces = defs.find((d: any) => d.placeReferences.length > 0);
    expect(withPlaces).toBeTruthy();
    expect(withPlaces.placeReferences[0].place.name).toBeTruthy();
    expect(typeof withPlaces.placeReferences[0].visible).toBe('boolean');
    expect(data.article).toMatchSnapshot();
  });

  it('returns empty place references for BM definitions', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        definitions { placeReferences { place { name } } }
      }
    }`);
    for (const def of data.article.definitions) {
      expect(def.placeReferences).toEqual([]);
    }
  });
});

describe('Norsk Ordbok literature references', () => {
  it('returns literature references on definitions', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        definitions {
          id
          literatureReferences {
            code id
            spec { textContent }
          }
          subDefinitions {
            id
            literatureReferences { code id }
          }
        }
      }
    }`);
    const defs = data.article.definitions;
    const allLitRefs = defs.flatMap((d: any) => [
      ...d.literatureReferences,
      ...d.subDefinitions.flatMap((s: any) => s.literatureReferences),
    ]);
    expect(allLitRefs.length).toBeGreaterThan(0);
    expect(allLitRefs[0].code).toBeTruthy();
    expect(typeof allLitRefs[0].id).toBe('number');
    expect(defs).toMatchSnapshot();
  });

  it('returns empty literature references for BM definitions', async () => {
    const data = await gql(`{
      article(id: 66381, dictionary: Bokmaalsordboka) {
        definitions { literatureReferences { code } }
      }
    }`);
    for (const def of data.article.definitions) {
      expect(def.literatureReferences).toEqual([]);
    }
  });
});

describe('Norsk Ordbok full nested structure', () => {
  it('returns all NO fields together', async () => {
    const data = await gql(`{
      article(id: 166337, dictionary: NorskOrdbok) {
        id dictionary wordClass gender
        lemmas { lemma }
        etymology { textContent }
        pronunciation { textContent }
        dialect { intro subcategories { forms { form } } }
        writtenForm { intro variants { writtenForm } }
        olderSources { code }
        definitions {
          id
          content { textContent }
          placeReferences { place { name } }
          literatureReferences { code }
        }
      }
    }`);
    expect(data.article.id).toBe(166337);
    expect(data.article.dictionary).toBe('NorskOrdbok');
    expect(data.article.etymology.length).toBeGreaterThan(0);
    expect(data.article.dialect.length).toBeGreaterThan(0);
    expect(data.article.writtenForm.length).toBeGreaterThan(0);
    expect(data.article.olderSources.length).toBeGreaterThan(0);
    expect(data.article.definitions.length).toBeGreaterThan(0);
  });
});

describe('Norsk Ordbok quirks', () => {
  it('handles articles where element.content is an empty array', async () => {
    const data = await gql(`{
      article(id: 266810, dictionary: NorskOrdbok) {
        id
        lemmas { lemma }
        definitions {
          id
          content { textContent }
          examples { textContent }
        }
      }
    }`);
    expect(data.article.id).toBe(266810);
    expect(data.article.lemmas.length).toBeGreaterThan(0);
    expect(data.article.definitions.length).toBeGreaterThan(0);
  });
});

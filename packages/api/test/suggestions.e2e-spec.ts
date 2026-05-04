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

describe('suggestions query', () => {
  it('returns exact matches with correct structure', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [Bokmaalsordboka]) {
        exact { word dictionaries articles { id } }
      }
    }`);
    const exact = data.suggestions.exact;
    const vane = exact.find((w: any) => w.word === 'vane');
    expect(vane).toBeTruthy();
    expect(vane.dictionaries).toContain('Bokmaalsordboka');
    expect(vane.articles.some((a: any) => a.id === 66381)).toBe(true);
  });

  it('returns inflection matches', async () => {
    const data = await gql(`{
      suggestions(word: "vanene", dictionaries: [Bokmaalsordboka]) {
        inflections { word articles { id } }
      }
    }`);
    expect(data.suggestions.inflections.length).toBeGreaterThan(0);
    const match = data.suggestions.inflections.find((w: any) =>
      w.articles.some((a: any) => a.id === 66381),
    );
    expect(match).toBeTruthy();
  });

  it('returns freetext results', async () => {
    const data = await gql(`{
      suggestions(word: "rutine", dictionaries: [Bokmaalsordboka]) {
        freetext { word articles { id } }
      }
    }`);
    expect(data.suggestions.freetext.length).toBeGreaterThan(0);
    const rutine = data.suggestions.freetext.find(
      (w: any) => w.word === 'rutine',
    );
    expect(rutine).toBeTruthy();
    expect(rutine.articles.some((a: any) => a.id === 49224)).toBe(true);
  });

  it('returns all four categories', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [Bokmaalsordboka]) {
        exact { word }
        inflections { word }
        freetext { word }
        similar { word }
      }
    }`);
    expect(Array.isArray(data.suggestions.exact)).toBe(true);
    expect(Array.isArray(data.suggestions.inflections)).toBe(true);
    expect(Array.isArray(data.suggestions.freetext)).toBe(true);
    expect(Array.isArray(data.suggestions.similar)).toBe(true);
  });

  it('returns suggestions with nested article detail', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [Bokmaalsordboka]) {
        exact {
          word
          articles {
            id dictionary wordClass
            lemmas { lemma }
            definitions { content { textContent } }
          }
        }
      }
    }`);
    const vane = data.suggestions.exact.find((w: any) => w.word === 'vane');
    const art66381 = vane.articles.find((a: any) => a.id === 66381);
    expect(art66381.dictionary).toBe('Bokmaalsordboka');
    expect(art66381.wordClass).toBe('Substantiv');
    expect(art66381.lemmas[0].lemma).toBe('vane');
    expect(art66381.definitions.length).toBeGreaterThan(0);
  });

  it('returns empty categories for gibberish input', async () => {
    const data = await gql(`{
      suggestions(word: "xyzzy987654", dictionaries: [Bokmaalsordboka]) {
        exact { word }
        inflections { word }
        freetext { word }
        similar { word }
      }
    }`);
    expect(data.suggestions.exact).toEqual([]);
    expect(data.suggestions.inflections).toEqual([]);
    expect(data.suggestions.freetext).toEqual([]);
  });

  it('filters suggestions by wordClass', async () => {
    const data = await gql(`{
      suggestions(word: "van", dictionaries: [Bokmaalsordboka], wordClass: Adjektiv) {
        exact { word articles { id wordClass } }
        freetext { word articles { id wordClass } }
      }
    }`);
    const allArticles = [
      ...data.suggestions.exact.flatMap((w: any) => w.articles),
      ...data.suggestions.freetext.flatMap((w: any) => w.articles),
    ];
    for (const a of allArticles) {
      expect(a.wordClass).toBe('Adjektiv');
    }
  });
});

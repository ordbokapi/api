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

describe('articles query', () => {
  it('returns results with default pagination', async () => {
    const data = await gql(`{
      articles(dictionaries: [Bokmaalsordboka]) {
        totalCount
        edges {
          node { id dictionary }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    expect(data.articles.edges.length).toBeGreaterThan(0);
    expect(data.articles.pageInfo.hasPreviousPage).toBe(false);
    expect(data.articles.pageInfo.startCursor).toBeDefined();
    expect(data.articles.pageInfo.endCursor).toBeDefined();
  });

  it('filters by word class', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { wordClass: Substantiv }
      ) {
        totalCount
        edges { node { id wordClass } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      expect(edge.node.wordClass).toBe('Substantiv');
    }
  });

  it('filters by gender', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { gender: Inkjekjoenn }
      ) {
        totalCount
        edges { node { id gender lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      expect(edge.node.gender).toBe('Inkjekjoenn');
    }
  });

  it('filters by split infinitive', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Nynorskordboka]
        filter: { hasSplitInfinitive: true }
      ) {
        totalCount
        edges { node { id lemmas { lemma splitInfinitive } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      const hasSplitInf = edge.node.lemmas.some(
        (l: any) => l.splitInfinitive === true,
      );
      expect(hasSplitInf).toBe(true);
    }
  });

  it('filters by lemma', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { lemma: { eq: "vane" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      const hasLemma = edge.node.lemmas.some((l: any) => l.lemma === 'vane');
      expect(hasLemma).toBe(true);
    }
  });

  it('filters by inflection', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { inflection: { eq: "vaner" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('supports full-text query', async () => {
    const data = await gql(`{
      articles(
        query: "vane"
        dictionaries: [Bokmaalsordboka]
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('combines query with filter', async () => {
    const data = await gql(`{
      articles(
        query: "vane"
        dictionaries: [Bokmaalsordboka]
        filter: { wordClass: Substantiv }
      ) {
        totalCount
        edges { node { id wordClass lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      expect(edge.node.wordClass).toBe('Substantiv');
    }
  });

  it('supports OR filter', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          OR: [
            { wordClass: Adjektiv }
            { wordClass: Verb }
          ]
        }
      ) {
        totalCount
        edges { node { id wordClass } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      expect(['Adjektiv', 'Verb']).toContain(edge.node.wordClass);
    }
  });

  it('supports NOT filter', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          wordClass: Substantiv
          NOT: { gender: Hankjoenn }
        }
      ) {
        totalCount
        edges { node { id wordClass gender } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    for (const edge of data.articles.edges) {
      expect(edge.node.wordClass).toBe('Substantiv');
      expect(edge.node.gender).not.toBe('Hankjoenn');
    }
  });

  it('paginates with first/after', async () => {
    const first = await gql(`{
      articles(dictionaries: [Bokmaalsordboka], first: 2) {
        totalCount
        edges { node { id } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`);
    expect(first.articles.edges.length).toBe(2);
    expect(first.articles.pageInfo.hasNextPage).toBe(true);

    const second = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        first: 2
        after: "${first.articles.pageInfo.endCursor}"
      ) {
        edges { node { id } cursor }
        pageInfo { hasPreviousPage }
      }
    }`);
    expect(second.articles.pageInfo.hasPreviousPage).toBe(true);
    const firstIds = first.articles.edges.map((e: any) => e.node.id);
    const secondIds = second.articles.edges.map((e: any) => e.node.id);
    expect(firstIds).not.toEqual(secondIds);
  });

  it('paginates with offset', async () => {
    const data = await gql(`{
      articles(dictionaries: [Bokmaalsordboka], first: 2, offset: 2) {
        edges { node { id } }
        pageInfo { hasPreviousPage }
      }
    }`);
    expect(data.articles.pageInfo.hasPreviousPage).toBe(true);
  });

  it('rejects combining after and offset', async () => {
    await expect(
      gql(`{
        articles(dictionaries: [Bokmaalsordboka], after: "WzJd", offset: 2) {
          totalCount
        }
      }`),
    ).rejects.toThrow();
  });

  it('rejects deeply nested filters', async () => {
    await expect(
      gql(`{
        articles(
          dictionaries: [Bokmaalsordboka]
          filter: {
            AND: [{
              AND: [{
                AND: [{
                  AND: [{ wordClass: Substantiv }]
                }]
              }]
            }]
          }
        ) { totalCount }
      }`),
    ).rejects.toThrow();
  });

  it('returns facets', async () => {
    const data = await gql(`{
      articles(dictionaries: [Bokmaalsordboka]) {
        totalCount
        facets {
          wordClass { value count }
          gender { value count }
        }
      }
    }`);
    expect(data.articles.facets).toBeDefined();
    expect(data.articles.facets.wordClass).toBeInstanceOf(Array);
    expect(data.articles.facets.wordClass.length).toBeGreaterThan(0);
    for (const fc of data.articles.facets.wordClass) {
      expect(fc.value).toBeDefined();
      expect(fc.count).toBeGreaterThan(0);
    }
  });

  it('searches across multiple dictionaries', async () => {
    const data = await gql(`{
      articles(
        query: "vane"
        dictionaries: [Bokmaalsordboka, Nynorskordboka]
      ) {
        totalCount
        edges { node { id dictionary } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    const dicts = new Set(
      data.articles.edges.map((e: any) => e.node.dictionary),
    );
    expect(dicts.size).toBeGreaterThanOrEqual(1);
  });

  it('returns empty results for impossible filter', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { lemma: { eq: "zzzzzznotaword" } }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBe(0);
    expect(data.articles.edges).toHaveLength(0);
  });

  it('supports sort by article ID', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { wordClass: Substantiv }
        sort: { field: ArticleId, direction: Asc }
        first: 5
      ) {
        edges { node { id } }
      }
    }`);
    const ids = data.articles.edges.map((e: any) => e.node.id);
    const sorted = [...ids].sort((a: number, b: number) => a - b);
    expect(ids).toEqual(sorted);
  });

  it('filters by etymologyText exists', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyText: { exists: true } }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);

    const none = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyText: { exists: false } }
      ) {
        totalCount
      }
    }`);
    expect(none.articles.totalCount).toBeGreaterThan(0);
    expect(
      data.articles.totalCount + none.articles.totalCount,
    ).toMatchInlineSnapshot(`49`);
  });

  it('filters by dialectForm exists', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { dialectForm: { exists: true } }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('filters by dialectPlace', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { dialectPlace: { eq: "Eidskog" } }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('filters by writtenFormSource', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { writtenFormSource: { code: { eq: "FløgstadKS" } } }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('returns boolean facets', async () => {
    const data = await gql(`{
      articles(dictionaries: [NorskOrdbok]) {
        facets {
          hasSplitInfinitive { value count }
        }
      }
    }`);
    expect(data.articles.facets.hasSplitInfinitive).toBeInstanceOf(Array);
    expect(data.articles.facets.hasSplitInfinitive.length).toBeGreaterThan(0);
    for (const fc of data.articles.facets.hasSplitInfinitive) {
      expect(['true', 'false']).toContain(fc.value);
      expect(fc.count).toBeGreaterThan(0);
    }
  });

  it('combines new filters with AND logic', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: {
          dialectForm: { exists: true }
          etymologyText: { exists: true }
        }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);

    const broader = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { dialectForm: { exists: true } }
      ) { totalCount }
    }`);
    expect(broader.articles.totalCount).toBeGreaterThanOrEqual(
      data.articles.totalCount,
    );
  });

  it('combines new filters with OR logic', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: {
          OR: [
            { dialectPlace: { eq: "Eidskog" } }
            { writtenFormSource: { code: { eq: "FløgstadKS" } } }
          ]
        }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);

    const eidskog = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { dialectPlace: { eq: "Eidskog" } }
      ) { totalCount }
    }`);
    const flogstad = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { writtenFormSource: { code: { eq: "FløgstadKS" } } }
      ) { totalCount }
    }`);
    expect(data.articles.totalCount).toBeGreaterThanOrEqual(
      Math.max(eidskog.articles.totalCount, flogstad.articles.totalCount),
    );
  });

  it('combines new filters with NOT logic', async () => {
    const withDialect = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: { dialectForm: { exists: true } }
      ) { totalCount }
    }`);
    const withoutEtym = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: {
          dialectForm: { exists: true }
          NOT: { etymologyText: { exists: true } }
        }
      ) { totalCount }
    }`);
    expect(withDialect.articles.totalCount).toMatchInlineSnapshot(`9`);
    expect(withoutEtym.articles.totalCount).toMatchInlineSnapshot(`4`);
  });

  it('nests new filters inside existing ones', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [NorskOrdbok]
        filter: {
          wordClass: Substantiv
          AND: [{ dialectForm: { exists: true } }, { etymologyText: { exists: true } }]
        }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toMatchInlineSnapshot(`5`);
  });

  it('filters by definitionText contains', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { definitionText: { contains: "sjøfart" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    expect(data.articles.edges.length).toBe(data.articles.totalCount);
  });

  it('filters by exampleText contains', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { exampleText: { contains: "instrument" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('filters by etymologyText contains', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyText: { contains: "naus" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('filters by pronunciationText contains', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { pronunciationText: { contains: "sen" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('filters by subArticleLemma contains', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { subArticleLemma: { contains: "grafisk" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('filters by etymologyLanguage', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyLanguage: Norroent }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
  });

  it('narrows definitionText contains with etymologyLanguage', async () => {
    const broad = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { definitionText: { contains: "sjøfart" } }
      ) { totalCount }
    }`);
    const narrow = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          definitionText: { contains: "sjøfart" }
          etymologyLanguage: Gresk
        }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(broad.articles.totalCount).toBeGreaterThan(
      narrow.articles.totalCount,
    );
    expect(narrow.articles.totalCount).toBeGreaterThan(0);
  });

  it('combines content filters with OR', async () => {
    const defOnly = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyText: { contains: "naus" } }
      ) { totalCount }
    }`);
    const pronOnly = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { pronunciationText: { contains: "sen" } }
      ) { totalCount }
    }`);
    const combined = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          OR: [
            { etymologyText: { contains: "naus" } }
            { pronunciationText: { contains: "sen" } }
          ]
        }
      ) { totalCount }
    }`);
    expect(combined.articles.totalCount).toBeGreaterThanOrEqual(
      Math.max(defOnly.articles.totalCount, pronOnly.articles.totalCount),
    );
  });

  it('combines content filters with NOT', async () => {
    const all = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { definitionText: { contains: "sjøfart" } }
      ) { totalCount }
    }`);
    const excluded = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          definitionText: { contains: "sjøfart" }
          NOT: { etymologyLanguage: Gresk }
        }
      ) { totalCount }
    }`);
    expect(all.articles.totalCount).toBeGreaterThan(0);
    expect(excluded.articles.totalCount).toBeGreaterThanOrEqual(0);
    expect(excluded.articles.totalCount).toBeLessThan(all.articles.totalCount);
  });

  it('combines content filters with AND', async () => {
    const broad = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { definitionText: { contains: "sjøfart" } }
      ) { totalCount }
    }`);
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          AND: [
            { definitionText: { contains: "sjøfart" } }
            { etymologyLanguage: Gresk }
          ]
        }
      ) { totalCount }
    }`);
    expect(data.articles.totalCount).toBeGreaterThan(0);
    expect(data.articles.totalCount).toBeLessThanOrEqual(
      broad.articles.totalCount,
    );
  });

  it('paginates with content filters', async () => {
    const first = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { wordClass: Substantiv }
        first: 2
      ) {
        totalCount
        edges { node { id } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`);
    expect(first.articles.totalCount).toBeGreaterThan(2);
    expect(first.articles.edges.length).toBe(2);
    expect(first.articles.pageInfo.hasNextPage).toBe(true);

    const second = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { wordClass: Substantiv }
        first: 2
        after: "${first.articles.pageInfo.endCursor}"
      ) {
        edges { node { id } cursor }
        pageInfo { hasPreviousPage }
      }
    }`);
    expect(second.articles.edges.length).toBeGreaterThan(0);
    expect(second.articles.pageInfo.hasPreviousPage).toBe(true);
    const firstIds = first.articles.edges.map((e: any) => e.node.id);
    const secondIds = second.articles.edges.map((e: any) => e.node.id);
    expect(firstIds).not.toEqual(secondIds);
  });

  it('returns empty results for content filter with no matches', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { definitionText: { contains: "zzzzxyznotaword" } }
      ) {
        totalCount
        edges { node { id } }
      }
    }`);
    expect(data.articles.totalCount).toBe(0);
    expect(data.articles.edges).toHaveLength(0);
  });

  it('combines etymologyLanguage with wordClass', async () => {
    const langOnly = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyLanguage: Norroent }
      ) { totalCount }
    }`);
    const combined = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          etymologyLanguage: Norroent
          wordClass: Substantiv
        }
      ) {
        totalCount
        edges { node { id wordClass } }
      }
    }`);
    expect(langOnly.articles.totalCount).toBeGreaterThan(0);
    expect(combined.articles.totalCount).toBeGreaterThan(0);
    expect(combined.articles.totalCount).toBeLessThanOrEqual(
      langOnly.articles.totalCount,
    );
    for (const edge of combined.articles.edges) {
      expect(edge.node.wordClass).toBe('Substantiv');
    }
  });

  it('sorts with content filter', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { wordClass: Substantiv }
        sort: { field: ArticleId, direction: Asc }
      ) {
        edges { node { id } }
      }
    }`);
    const ids = data.articles.edges.map((e: any) => e.node.id);
    const sorted = [...ids].sort((a: number, b: number) => a - b);
    expect(ids).toEqual(sorted);
  });

  it('filters by lemma startsWith', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { lemma: { startsWith: "vane" } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toMatchInlineSnapshot(`4`);
    for (const edge of data.articles.edges) {
      const hasMatch = edge.node.lemmas.some((l: any) =>
        l.lemma.startsWith('vane'),
      );
      expect(hasMatch).toBe(true);
    }
  });

  it('filters by lemma in', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { lemma: { in: ["vane", "vannbasseng"] } }
      ) {
        totalCount
        edges { node { id lemmas { lemma } } }
      }
    }`);
    expect(data.articles.totalCount).toMatchInlineSnapshot(`2`);
    for (const edge of data.articles.edges) {
      const hasMatch = edge.node.lemmas.some(
        (l: any) => l.lemma === 'vane' || l.lemma === 'vannbasseng',
      );
      expect(hasMatch).toBe(true);
    }
  });

  it('narrows startsWith with wordClass', async () => {
    const broad = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { lemma: { startsWith: "van" } }
      ) { totalCount }
    }`);
    const narrow = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: {
          lemma: { startsWith: "van" }
          wordClass: Substantiv
        }
      ) { totalCount }
    }`);
    expect(broad.articles.totalCount).toMatchInlineSnapshot(`7`);
    expect(narrow.articles.totalCount).toMatchInlineSnapshot(`4`);
  });

  it('filters by exists true', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyText: { exists: true } }
      ) { totalCount }
    }`);
    expect(data.articles.totalCount).toMatchInlineSnapshot(`13`);
  });

  it('filters by exists false', async () => {
    const data = await gql(`{
      articles(
        dictionaries: [Bokmaalsordboka]
        filter: { etymologyText: { exists: false } }
      ) { totalCount }
    }`);
    expect(data.articles.totalCount).toMatchInlineSnapshot(`36`);
  });
});

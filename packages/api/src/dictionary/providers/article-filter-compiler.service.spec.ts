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

import { describe, test, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ArticleFilterCompiler } from './article-filter-compiler.service';
import { WordClass } from '../models/word-class.model';
import { Gender } from '../models/gender.model';
import { InflectionTag } from '../models/inflection-tag.model';
import { EtymologyLanguage } from '../models/etymology-language.model';
import {
  ArticleSortField,
  SortDirection,
} from '../models/article-filter/article-sort.input';

describe('ArticleFilterCompiler', () => {
  const compiler = new ArticleFilterCompiler();
  const compileFilter = (filter: Parameters<typeof compiler.compile>[0]) =>
    compiler.compile(filter);

  describe('compile', () => {
    describe('single field filters', () => {
      test('wordClass', () => {
        expect(compileFilter({ wordClass: WordClass.Substantiv })).toBe(
          'paradigm_tags = "NOUN"',
        );
      });

      test('all word classes map correctly', () => {
        const expected: [WordClass, string][] = [
          [WordClass.Substantiv, 'NOUN'],
          [WordClass.Adjektiv, 'ADJ'],
          [WordClass.Adverb, 'ADV'],
          [WordClass.Verb, 'VERB'],
          [WordClass.Pronomen, 'PRON'],
          [WordClass.Preposisjon, 'ADP'],
          [WordClass.Konjunksjon, 'CCONJ'],
          [WordClass.Interjeksjon, 'INTJ'],
          [WordClass.Determinativ, 'DET'],
          [WordClass.Subjunksjon, 'SCONJ'],
          [WordClass.Symbol, 'SYM'],
          [WordClass.Forkorting, 'ABBR'],
          [WordClass.Uttrykk, 'EXPR'],
        ];
        for (const [wc, tag] of expected) {
          expect(compileFilter({ wordClass: wc })).toBe(
            `paradigm_tags = "${tag}"`,
          );
        }
      });

      test('gender', () => {
        expect(compileFilter({ gender: Gender.Hankjoenn })).toBe(
          'paradigm_tags = "Masc"',
        );
        expect(compileFilter({ gender: Gender.Hokjoenn })).toBe(
          'paradigm_tags = "Fem"',
        );
        expect(compileFilter({ gender: Gender.Inkjekjoenn })).toBe(
          'paradigm_tags = "Neuter"',
        );
        expect(compileFilter({ gender: Gender.HankjoennHokjoenn })).toBe(
          'paradigm_tags = "Masc/Fem"',
        );
      });

      test('hasSplitInfinitive true', () => {
        expect(compileFilter({ hasSplitInfinitive: true })).toBe(
          'has_split_inf = true',
        );
      });

      test('hasSplitInfinitive false', () => {
        expect(compileFilter({ hasSplitInfinitive: false })).toBe(
          'has_split_inf = false',
        );
      });

      test('inflectionTags single', () => {
        expect(compileFilter({ inflectionTags: [InflectionTag.Presens] })).toBe(
          'inflection_tags = "Pres"',
        );
      });

      test('inflectionTags multiple', () => {
        expect(
          compileFilter({
            inflectionTags: [InflectionTag.Eintal, InflectionTag.Bestemt],
          }),
        ).toBe('inflection_tags = "Sing" AND inflection_tags = "Def"');
      });

      test('lemma', () => {
        expect(compileFilter({ lemma: { eq: 'vane' } })).toBe(
          'lemmas = "vane"',
        );
      });

      test('inflection', () => {
        expect(compileFilter({ inflection: { eq: 'vaner' } })).toBe(
          'inflections = "vaner"',
        );
      });

      test('etymologyText exists true', () => {
        expect(compileFilter({ etymologyText: { exists: true } })).toBe(
          'etymology_text IS NOT EMPTY',
        );
      });

      test('etymologyText exists false', () => {
        expect(compileFilter({ etymologyText: { exists: false } })).toBe(
          'etymology_text IS EMPTY',
        );
      });

      test('pronunciationText exists', () => {
        expect(compileFilter({ pronunciationText: { exists: true } })).toBe(
          'pronunciation_text IS NOT EMPTY',
        );
      });

      test('dialectForm exists', () => {
        expect(compileFilter({ dialectForm: { exists: true } })).toBe(
          'dialect_forms IS NOT EMPTY',
        );
      });

      test('dialectPlace', () => {
        expect(
          compileFilter({ dialectPlace: { name: { eq: 'Eidskog' } } }),
        ).toBe('dialect_place_names = "Eidskog"');
      });

      test('olderSource code', () => {
        expect(compileFilter({ olderSource: { code: { eq: 'ROSS' } } })).toBe(
          'older_source_codes = "ROSS"',
        );
      });

      test('writtenFormSource code', () => {
        expect(
          compileFilter({
            writtenFormSource: { code: { eq: 'FløgstadKS' } },
          }),
        ).toBe('written_form_source_codes = "FløgstadKS"');
      });

      test('attestationSource code', () => {
        expect(
          compileFilter({ attestationSource: { code: { eq: 'A' } } }),
        ).toBe('attestation_source_codes = "A"');
      });

      test('etymologyLanguage with single raw code', () => {
        expect(
          compileFilter({ etymologyLanguage: EtymologyLanguage.Finsk }),
        ).toBe('etymology_languages = "finsk"');
      });

      test('etymologyLanguage with multiple raw codes', () => {
        const result = compileFilter({
          etymologyLanguage: EtymologyLanguage.Norroent,
        });
        expect(result).toMatch(/^\(/);
        expect(result).toContain('etymology_languages = "norr."');
        expect(result).toContain(' OR ');
      });
    });

    describe('contains filters', () => {
      test('etymologyText contains', () => {
        expect(compileFilter({ etymologyText: { contains: 'latin' } })).toBe(
          'etymology_text CONTAINS "latin"',
        );
      });

      test('definitionText contains', () => {
        expect(compileFilter({ definitionText: { contains: 'fisk' } })).toBe(
          'definition_text CONTAINS "fisk"',
        );
      });

      test('exampleText contains', () => {
        expect(compileFilter({ exampleText: { contains: 'havet' } })).toBe(
          'example_text CONTAINS "havet"',
        );
      });

      test('pronunciationText contains', () => {
        expect(
          compileFilter({ pronunciationText: { contains: 'retrofleks' } }),
        ).toBe('pronunciation_text CONTAINS "retrofleks"');
      });

      test('dialectForm contains', () => {
        expect(compileFilter({ dialectForm: { contains: 'bikkje' } })).toBe(
          'dialect_forms CONTAINS "bikkje"',
        );
      });

      test('writtenForm contains', () => {
        expect(compileFilter({ writtenForm: { contains: 'fiske' } })).toBe(
          'written_forms CONTAINS "fiske"',
        );
      });

      test('subArticleLemma contains', () => {
        expect(
          compileFilter({ subArticleLemma: { contains: 'storfisk' } }),
        ).toBe('sub_article_lemmas CONTAINS "storfisk"');
      });

      test('mixed filter and contains', () => {
        const result = compileFilter({
          wordClass: WordClass.Substantiv,
          definitionText: { contains: 'fisk' },
          etymologyLanguage: EtymologyLanguage.Latin,
        });
        expect(result).toContain('paradigm_tags = "NOUN"');
        expect(result).toContain('definition_text CONTAINS "fisk"');
        expect(result).toContain('etymology_languages = "lat."');
      });

      test('multiple contains', () => {
        const result = compileFilter({
          definitionText: { contains: 'fisk' },
          exampleText: { contains: 'havet' },
        });
        expect(result).toContain('definition_text CONTAINS "fisk"');
        expect(result).toContain('example_text CONTAINS "havet"');
        expect(result).toContain(' AND ');
      });
    });

    describe('startsWith filters', () => {
      test('lemma startsWith', () => {
        expect(compileFilter({ lemma: { startsWith: 'van' } })).toBe(
          'lemmas STARTS WITH "van"',
        );
      });

      test('definitionText startsWith', () => {
        expect(compileFilter({ definitionText: { startsWith: 'sjø' } })).toBe(
          'definition_text STARTS WITH "sjø"',
        );
      });
    });

    describe('in filters', () => {
      test('lemma in single value', () => {
        expect(compileFilter({ lemma: { in: ['vane'] } })).toBe(
          'lemmas IN ["vane"]',
        );
      });

      test('lemma in multiple values', () => {
        expect(compileFilter({ lemma: { in: ['vane', 'vante'] } })).toBe(
          'lemmas IN ["vane", "vante"]',
        );
      });

      test('escapes values in list', () => {
        expect(compileFilter({ lemma: { in: ['say "hi"', 'ok'] } })).toBe(
          'lemmas IN ["say \\"hi\\"", "ok"]',
        );
      });

      test('dialectPlace in', () => {
        expect(
          compileFilter({
            dialectPlace: { name: { in: ['Eidskog', 'Ringsaker'] } },
          }),
        ).toBe('dialect_place_names IN ["Eidskog", "Ringsaker"]');
      });
    });

    describe('exists filters', () => {
      test('exists true', () => {
        expect(compileFilter({ etymologyText: { exists: true } })).toBe(
          'etymology_text IS NOT EMPTY',
        );
      });

      test('exists false', () => {
        expect(compileFilter({ etymologyText: { exists: false } })).toBe(
          'etymology_text IS EMPTY',
        );
      });

      test('dialectPlace exists', () => {
        expect(
          compileFilter({ dialectPlace: { name: { exists: true } } }),
        ).toBe('dialect_place_names IS NOT EMPTY');
      });
    });

    describe('escaping', () => {
      test('escapes double quotes in string values', () => {
        expect(compileFilter({ lemma: { eq: 'say "hello"' } })).toBe(
          'lemmas = "say \\"hello\\""',
        );
      });

      test('escapes backslashes in string values', () => {
        expect(compileFilter({ lemma: { eq: 'back\\slash' } })).toBe(
          'lemmas = "back\\\\slash"',
        );
      });

      test('escapes in dialectPlace', () => {
        expect(
          compileFilter({ dialectPlace: { name: { eq: 'Sted "Nord"' } } }),
        ).toBe('dialect_place_names = "Sted \\"Nord\\""');
      });
    });

    describe('implicit AND', () => {
      test('wordClass + gender', () => {
        expect(
          compileFilter({
            wordClass: WordClass.Substantiv,
            gender: Gender.Hankjoenn,
          }),
        ).toBe('paradigm_tags = "NOUN" AND paradigm_tags = "Masc"');
      });

      test('dialectForm exists + etymologyText exists', () => {
        expect(
          compileFilter({
            dialectForm: { exists: true },
            etymologyText: { exists: true },
          }),
        ).toBe('etymology_text IS NOT EMPTY AND dialect_forms IS NOT EMPTY');
      });

      test('wordClass + lemma + hasSplitInfinitive', () => {
        expect(
          compileFilter({
            wordClass: WordClass.Verb,
            lemma: { eq: 'kaste' },
            hasSplitInfinitive: false,
          }),
        ).toBe(
          'paradigm_tags = "VERB" AND has_split_inf = false AND lemmas = "kaste"',
        );
      });
    });

    describe('AND combinator', () => {
      test('two sub-filters', () => {
        expect(
          compileFilter({
            AND: [
              { wordClass: WordClass.Substantiv },
              { gender: Gender.Hankjoenn },
            ],
          }),
        ).toBe('(paradigm_tags = "NOUN" AND paradigm_tags = "Masc")');
      });

      test('mixed with top-level field', () => {
        expect(
          compileFilter({
            dialectForm: { exists: true },
            AND: [{ dialectPlace: { name: { eq: 'Eidskog' } } }],
          }),
        ).toBe(
          'dialect_forms IS NOT EMPTY AND (dialect_place_names = "Eidskog")',
        );
      });
    });

    describe('OR combinator', () => {
      test('two sub-filters', () => {
        expect(
          compileFilter({
            OR: [
              { wordClass: WordClass.Adjektiv },
              { wordClass: WordClass.Verb },
            ],
          }),
        ).toBe('(paradigm_tags = "ADJ" OR paradigm_tags = "VERB")');
      });

      test('OR with new fields', () => {
        expect(
          compileFilter({
            OR: [
              { dialectPlace: { name: { eq: 'Eidskog' } } },
              { writtenFormSource: { code: { eq: 'FløgstadKS' } } },
            ],
          }),
        ).toBe(
          '(dialect_place_names = "Eidskog" OR written_form_source_codes = "FløgstadKS")',
        );
      });
    });

    describe('NOT combinator', () => {
      test('negates a sub-filter', () => {
        expect(compileFilter({ NOT: { gender: Gender.Hankjoenn } })).toBe(
          'NOT (paradigm_tags = "Masc")',
        );
      });

      test('combined with top-level fields', () => {
        expect(
          compileFilter({
            dialectForm: { exists: true },
            NOT: { etymologyText: { exists: true } },
          }),
        ).toBe(
          'dialect_forms IS NOT EMPTY AND NOT (etymology_text IS NOT EMPTY)',
        );
      });
    });

    describe('nested combinators', () => {
      test('AND inside OR', () => {
        expect(
          compileFilter({
            OR: [
              { wordClass: WordClass.Substantiv, gender: Gender.Hankjoenn },
              { wordClass: WordClass.Verb },
            ],
          }),
        ).toBe(
          '(paradigm_tags = "NOUN" AND paradigm_tags = "Masc" OR paradigm_tags = "VERB")',
        );
      });

      test('NOT inside AND', () => {
        expect(
          compileFilter({
            AND: [
              { dialectForm: { exists: true } },
              { NOT: { etymologyText: { exists: true } } },
            ],
          }),
        ).toBe(
          '(dialect_forms IS NOT EMPTY AND NOT (etymology_text IS NOT EMPTY))',
        );
      });

      test('three levels deep', () => {
        expect(
          compileFilter({
            AND: [
              {
                OR: [
                  { wordClass: WordClass.Substantiv },
                  { wordClass: WordClass.Verb },
                ],
              },
              { dialectForm: { exists: true } },
            ],
          }),
        ).toBe(
          '((paradigm_tags = "NOUN" OR paradigm_tags = "VERB") AND dialect_forms IS NOT EMPTY)',
        );
      });
    });

    describe('empty filter', () => {
      test('returns empty string for empty object', () => {
        expect(compileFilter({})).toBe('');
      });

      test('skips undefined/null boolean fields', () => {
        expect(
          compileFilter({
            hasSplitInfinitive: undefined,
          }),
        ).toBe('');
      });
    });

    describe('validation', () => {
      test('rejects depth > 3', () => {
        expect(() =>
          compileFilter({
            AND: [
              {
                AND: [
                  {
                    AND: [{ AND: [{ wordClass: WordClass.Substantiv }] }],
                  },
                ],
              },
            ],
          }),
        ).toThrow(BadRequestException);
      });

      test('rejects > 30 clauses', () => {
        const manyFilters = Array.from({ length: 31 }, () => ({
          wordClass: WordClass.Substantiv,
        }));
        expect(() => compiler.compile({ AND: manyFilters })).toThrow(
          BadRequestException,
        );
      });

      test('counts clauses across AND, OR, NOT', () => {
        const filter = {
          AND: Array.from({ length: 10 }, () => ({
            wordClass: WordClass.Substantiv,
          })),
          OR: Array.from({ length: 10 }, () => ({
            wordClass: WordClass.Verb,
          })),
          NOT: {
            AND: Array.from({ length: 10 }, () => ({
              gender: Gender.Hankjoenn,
            })),
          },
        };
        // 1 (root) + 10 (AND) + 10 (OR) + 1 (NOT) + 10 (NOT.AND) = 32 > 30
        expect(() => compiler.compile(filter)).toThrow(BadRequestException);
      });
    });
  });

  describe('compileSort', () => {
    test('ascending', () => {
      expect(
        compiler.compileSort({
          field: ArticleSortField.ArticleId,
          direction: SortDirection.Asc,
        }),
      ).toEqual(['article_id:asc']);
    });

    test('descending', () => {
      expect(
        compiler.compileSort({
          field: ArticleSortField.ArticleId,
          direction: SortDirection.Desc,
        }),
      ).toEqual(['article_id:desc']);
    });
  });

  describe('mapFacetWordClass', () => {
    test('maps known tags', () => {
      expect(compiler.mapFacetWordClass('NOUN')).toBe(WordClass.Substantiv);
      expect(compiler.mapFacetWordClass('VERB')).toBe(WordClass.Verb);
      expect(compiler.mapFacetWordClass('ADJ')).toBe(WordClass.Adjektiv);
    });

    test('returns undefined for unknown tags', () => {
      expect(compiler.mapFacetWordClass('Masc')).toBeUndefined();
      expect(compiler.mapFacetWordClass('unknown')).toBeUndefined();
    });
  });

  describe('mapFacetGender', () => {
    test('maps known tags', () => {
      expect(compiler.mapFacetGender('Masc')).toBe(Gender.Hankjoenn);
      expect(compiler.mapFacetGender('Fem')).toBe(Gender.Hokjoenn);
      expect(compiler.mapFacetGender('Neuter')).toBe(Gender.Inkjekjoenn);
      expect(compiler.mapFacetGender('Masc/Fem')).toBe(
        Gender.HankjoennHokjoenn,
      );
    });

    test('returns undefined for unknown tags', () => {
      expect(compiler.mapFacetGender('NOUN')).toBeUndefined();
      expect(compiler.mapFacetGender('unknown')).toBeUndefined();
    });
  });
});

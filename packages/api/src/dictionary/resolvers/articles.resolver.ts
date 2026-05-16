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

import { BadRequestException, Injectable } from '@nestjs/common';
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UibDbService } from 'ordbokapi-common';
import { ArticleFilterCompiler } from '../providers/article-filter-compiler.service';
import {
  Article,
  Dictionary,
  ArticleConnection,
  ArticleEdge,
  PageInfo,
  ArticleFacets,
  BibliographyFacets,
  PlaceFacets,
  FacetCount,
  toUibDictionary,
} from '../models';
import { ArticleFilter } from '../models/article-filter/article-filter.input';
import { ArticleSort } from '../models/article-filter/article-sort.input';

const maxLimit = 100;
const facetAttributes = [
  'paradigm_tags',
  'inflection_tags',
  'has_split_inf',
  'dialect_places',
  'dialect_place_names',
  'dialect_place_codes',
  'dialect_place_types',
  'attestation_place_names',
  'attestation_place_codes',
  'attestation_place_types',
  'place_names',
  'place_codes',
  'place_types',
  'older_source_codes',
  'older_source_authors',
  'older_source_titles',
  'older_source_years',
  'written_form_source_codes',
  'written_form_source_authors',
  'written_form_source_titles',
  'written_form_source_years',
  'attestation_source_codes',
  'attestation_source_authors',
  'attestation_source_titles',
  'attestation_source_years',
  'bibliography_codes',
  'bibliography_authors',
  'bibliography_titles',
  'bibliography_years',
  'etymology_languages',
];

function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify([offset])).toString('base64url');
}

function decodeCursor(cursor: string): number {
  try {
    const [offset] = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    );
    if (typeof offset !== 'number' || offset < 0) {
      throw new Error();
    }
    return offset;
  } catch {
    throw new BadRequestException('Ugyldig markør.');
  }
}

@Injectable()
@Resolver()
export class ArticlesResolver {
  constructor(
    private readonly data: UibDbService,
    private readonly filterCompiler: ArticleFilterCompiler,
  ) {}

  @Query(() => ArticleConnection, {
    description:
      'Søk etter artiklar med fritekstsøk og/eller strukturerte filter.',
  })
  async articles(
    @Args('query', {
      type: () => String,
      nullable: true,
      description: 'Fritekstsøk.',
    })
    query: string | undefined,
    @Args('filter', {
      type: () => ArticleFilter,
      nullable: true,
      description: 'Strukturert filter.',
    })
    filter: ArticleFilter | undefined,
    @Args('dictionaries', {
      type: () => [Dictionary],
      defaultValue: Object.values(Dictionary),
      description: 'Ordbøkene det skal søkjast i.',
    })
    dictionaries: Dictionary[],
    @Args('sort', {
      type: () => ArticleSort,
      nullable: true,
      description: 'Sortering.',
    })
    sort: ArticleSort | undefined,
    @Args('first', {
      type: () => Int,
      nullable: true,
      description: 'Talet på resultat å hente. Maks 100.',
    })
    first: number | undefined,
    @Args('after', {
      type: () => String,
      nullable: true,
      description: 'Hent resultat etter denne markøren.',
    })
    after: string | undefined,
    @Args('offset', {
      type: () => Int,
      nullable: true,
      description:
        'Direkte offset-paginering. Kan ikkje kombinerast med «after».',
    })
    offsetArg: number | undefined,
  ): Promise<ArticleConnection> {
    if (after !== undefined && offsetArg !== undefined) {
      throw new BadRequestException(
        'Kan ikkje bruke både «after» og «offset» samstundes.',
      );
    }

    const limit = Math.min(first ?? 20, maxLimit);
    let offset: number;

    if (after !== undefined) {
      offset = decodeCursor(after);
    } else {
      offset = offsetArg ?? 0;
    }

    const meiliFilter = filter
      ? this.filterCompiler.compile(filter)
      : undefined;
    const meiliSort = sort ? this.filterCompiler.compileSort(sort) : undefined;

    const uibDictionaries = dictionaries.map(toUibDictionary);

    const result = await this.data.searchFaceted(uibDictionaries, query ?? '', {
      filter: meiliFilter,
      sort: meiliSort,
      facets: facetAttributes,
      limit,
      offset,
    });

    const edges: ArticleEdge[] = result.identifiers.map((id, i) => ({
      node: new Article({
        id: id.id,
        dictionary: dictionaries.find(
          (d) => toUibDictionary(d) === id.dictionary,
        )!,
      }),
      cursor: encodeCursor(offset + i + 1),
    }));

    const pageInfo: PageInfo = {
      hasNextPage: offset + limit < result.total,
      hasPreviousPage: offset > 0,
      startCursor: edges.length > 0 ? encodeCursor(offset) : undefined,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    };

    let facets: ArticleFacets | undefined;
    if (result.facetDistribution) {
      facets = this.#buildFacets(result.facetDistribution);
    }

    return { edges, pageInfo, totalCount: result.total, facets };
  }

  #buildFacets(
    distribution: Record<string, Record<string, number>>,
  ): ArticleFacets {
    const facets: ArticleFacets = {};

    const paradigmTags = distribution['paradigm_tags'];
    if (paradigmTags) {
      const wordClassCounts: FacetCount[] = [];
      const genderCounts: FacetCount[] = [];

      for (const [tag, count] of Object.entries(paradigmTags)) {
        const wc = this.filterCompiler.mapFacetWordClass(tag);
        if (wc) {
          wordClassCounts.push({ value: wc, count });
          continue;
        }
        const g = this.filterCompiler.mapFacetGender(tag);
        if (g) {
          genderCounts.push({ value: g, count });
        }
      }

      if (wordClassCounts.length > 0) {
        facets.wordClass = wordClassCounts.sort((a, b) => b.count - a.count);
      }
      if (genderCounts.length > 0) {
        facets.gender = genderCounts.sort((a, b) => b.count - a.count);
      }
    }

    const inflTagFacet = distribution['inflection_tags'];
    if (inflTagFacet) {
      const counts: FacetCount[] = [];
      for (const [tag, count] of Object.entries(inflTagFacet)) {
        const mapped = this.filterCompiler.mapFacetInflectionTag(tag);
        if (mapped) {
          counts.push({ value: mapped, count });
        }
      }
      if (counts.length > 0) {
        facets.inflectionTags = counts.sort((a, b) => b.count - a.count);
      }
    }

    const splitInfFacet = distribution['has_split_inf'];
    if (splitInfFacet) {
      facets.hasSplitInfinitive = this.#boolFacetCounts(splitInfFacet);
    }

    const dialectPlaces = distribution['dialect_places'];
    if (dialectPlaces) {
      facets.dialectPlace = facets.dialectPlace ?? {};
      facets.dialectPlace.name = [
        ...(facets.dialectPlace.name ?? []),
        ...this.#rawFacetCounts(dialectPlaces),
      ];
    }

    facets.dialectPlace = this.#mergePlaceFacets(
      facets.dialectPlace,
      this.#buildPlaceFacets(distribution, 'dialect_place'),
    );
    facets.attestationPlace = this.#buildPlaceFacets(
      distribution,
      'attestation_place',
    );

    facets.olderSource = this.#buildBibliographyFacets(
      distribution,
      'older_source',
    );
    facets.writtenFormSource = this.#buildBibliographyFacets(
      distribution,
      'written_form_source',
    );
    facets.attestationSource = this.#buildBibliographyFacets(
      distribution,
      'attestation_source',
    );
    facets.bibliography = this.#buildBibliographyFacets(
      distribution,
      'bibliography',
    );

    facets.place = this.#buildPlaceFacets(distribution, 'place');

    const etymLangs = distribution['etymology_languages'];
    if (etymLangs) {
      const counts: FacetCount[] = [];
      for (const [code, count] of Object.entries(etymLangs)) {
        const mapped = this.filterCompiler.mapFacetEtymologyLanguage(code);
        if (mapped) {
          const existing = counts.find((c) => c.value === mapped);
          if (existing) {
            existing.count += count;
          } else {
            counts.push({ value: mapped, count });
          }
        }
      }
      if (counts.length > 0) {
        facets.etymologyLanguage = counts.sort((a, b) => b.count - a.count);
      }
    }

    return facets;
  }

  #buildBibliographyFacets(
    distribution: Record<string, Record<string, number>>,
    prefix: string,
  ): BibliographyFacets | undefined {
    const codes = distribution[`${prefix}_codes`];
    const authors = distribution[`${prefix}_authors`];
    const titles = distribution[`${prefix}_titles`];
    const years = distribution[`${prefix}_years`];

    if (!codes && !authors && !titles && !years) {
      return undefined;
    }

    const result: BibliographyFacets = {};
    if (codes) result.code = this.#rawFacetCounts(codes);
    if (authors) result.author = this.#rawFacetCounts(authors);
    if (titles) result.title = this.#rawFacetCounts(titles);
    if (years) result.year = this.#rawFacetCounts(years);
    return result;
  }

  #buildPlaceFacets(
    distribution: Record<string, Record<string, number>>,
    prefix: string,
  ): PlaceFacets | undefined {
    const names = distribution[`${prefix}_names`];
    const codes = distribution[`${prefix}_codes`];
    const types = distribution[`${prefix}_types`];

    if (!names && !codes && !types) {
      return undefined;
    }

    const result: PlaceFacets = {};

    if (names) {
      result.name = this.#rawFacetCounts(names);
    }

    if (codes) {
      result.code = this.#rawFacetCounts(codes);
    }

    if (types) {
      result.type = this.#rawFacetCounts(types);
    }

    return result;
  }

  #mergePlaceFacets(
    a: PlaceFacets | undefined,
    b: PlaceFacets | undefined,
  ): PlaceFacets | undefined {
    if (!a && !b) {
      return undefined;
    }

    if (!a) {
      return b;
    }

    if (!b) {
      return a;
    }

    return {
      name: [...(a.name ?? []), ...(b.name ?? [])],
      code: [...(a.code ?? []), ...(b.code ?? [])],
      type: [...(a.type ?? []), ...(b.type ?? [])],
    };
  }

  #boolFacetCounts(dist: Record<string, number>): FacetCount[] {
    const counts: FacetCount[] = [];
    for (const [val, count] of Object.entries(dist)) {
      counts.push({ value: val, count });
    }
    return counts.sort((a, b) => b.count - a.count);
  }

  #rawFacetCounts(dist: Record<string, number>): FacetCount[] {
    return Object.entries(dist)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }
}

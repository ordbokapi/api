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

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Eit namn og tal for ein fasettkategori.',
})
export class FacetCount {
  @Field(() => String, { description: 'Verdien av fasetten.' })
  value: string;

  @Field(() => Int, { description: 'Antal treff med denne verdien.' })
  count: number;
}

@ObjectType({
  description: 'Fasettfordeling for ein bibliografisk kategori.',
})
export class BibliographyFacets {
  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter kjeldekode.',
  })
  code?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter forfattar.',
  })
  author?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter tittel.',
  })
  title?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter utgjevingsår.',
  })
  year?: FacetCount[];
}

@ObjectType({
  description: 'Fasettfordeling for geografiske stader.',
})
export class PlaceFacets {
  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter stadnamn.',
  })
  name?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter stadkode (kortform).',
  })
  code?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter stadtype.',
  })
  type?: FacetCount[];
}

@ObjectType({
  description:
    'Aggregerte tal over søkeresultat, fordelt på ulike eigenskapar.',
})
export class ArticleFacets {
  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter ordklasse.',
  })
  wordClass?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter grammatisk kjønn.',
  })
  gender?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter om dei har kløyvd infinitiv.',
  })
  hasSplitInfinitive?: FacetCount[];

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter bøyingsmerke.',
  })
  inflectionTags?: FacetCount[];

  @Field(() => PlaceFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter stader knytte til dialektformer.',
  })
  dialectPlace?: PlaceFacets;

  @Field(() => PlaceFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter stader knytte til heimfesting.',
  })
  attestationPlace?: PlaceFacets;

  @Field(() => BibliographyFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter eldre kjelde.',
  })
  olderSource?: BibliographyFacets;

  @Field(() => BibliographyFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter skriftformkjelde.',
  })
  writtenFormSource?: BibliographyFacets;

  @Field(() => BibliographyFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter heimfestingskjelde.',
  })
  attestationSource?: BibliographyFacets;

  @Field(() => [FacetCount], {
    nullable: true,
    description: 'Fordeling av resultat etter etymologisk opphavsspråk.',
  })
  etymologyLanguage?: FacetCount[];

  @Field(() => BibliographyFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter bibliografisk kjelde.',
  })
  bibliography?: BibliographyFacets;

  @Field(() => PlaceFacets, {
    nullable: true,
    description: 'Fordeling av resultat etter geografiske stader.',
  })
  place?: PlaceFacets;
}

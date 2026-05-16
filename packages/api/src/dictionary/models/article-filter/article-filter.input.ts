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

import { Field, InputType } from '@nestjs/graphql';
import { WordClass } from '../word-class.model';
import { Gender } from '../gender.model';
import { InflectionTag } from '../inflection-tag.model';
import { EtymologyLanguage } from '../etymology-language.model';
import { BibliographyFilter } from './bibliography-filter.input';
import { PlaceFilter } from './place-filter.input';
import { StringFilter } from './string-filter.input';

@InputType({
  description:
    'Filter for artikkelsøk. Felt på same nivå vert kombinerte med OG-logikk (AND).',
})
export class ArticleFilter {
  @Field(() => WordClass, {
    nullable: true,
    description: 'Filtrer etter ordklasse.',
  })
  wordClass?: WordClass;

  @Field(() => Gender, {
    nullable: true,
    description: 'Filtrer etter grammatisk kjønn.',
  })
  gender?: Gender;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Filtrer etter om verbet har kløyvd infinitiv.',
  })
  hasSplitInfinitive?: boolean;

  @Field(() => [InflectionTag], {
    nullable: true,
    description:
      'Filtrer etter bøyingsmerke. Alle oppgjevne merke må finnast saman for å matchast.',
  })
  inflectionTags?: InflectionTag[];

  @Field(() => EtymologyLanguage, {
    nullable: true,
    description: 'Filtrer etter etymologisk opphavsspråk.',
  })
  etymologyLanguage?: EtymologyLanguage;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter lemma.',
  })
  lemma?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter bøyingsform.',
  })
  inflection?: StringFilter;

  @Field(() => PlaceFilter, {
    nullable: true,
    description: 'Filtrer etter stader knytte til dialektformer.',
  })
  dialectPlace?: PlaceFilter;

  @Field(() => PlaceFilter, {
    nullable: true,
    description: 'Filtrer etter stader knytte til heimfesting.',
  })
  attestationPlace?: PlaceFilter;

  @Field(() => PlaceFilter, {
    nullable: true,
    description: 'Filtrer etter geografiske stader.',
  })
  place?: PlaceFilter;

  @Field(() => BibliographyFilter, {
    nullable: true,
    description: 'Filtrer etter eldre kjelder.',
  })
  olderSource?: BibliographyFilter;

  @Field(() => BibliographyFilter, {
    nullable: true,
    description: 'Filtrer etter skriftformkjelder.',
  })
  writtenFormSource?: BibliographyFilter;

  @Field(() => BibliographyFilter, {
    nullable: true,
    description: 'Filtrer etter heimfestingskjelde.',
  })
  attestationSource?: BibliographyFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter etymologitekst.',
  })
  etymologyText?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter definisjonar.',
  })
  definitionText?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter bruksdøme.',
  })
  exampleText?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter uttaletekst.',
  })
  pronunciationText?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter dialektformer.',
  })
  dialectForm?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter skriftformer.',
  })
  writtenForm?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter underartiklar og uttrykk.',
  })
  subArticleLemma?: StringFilter;

  @Field(() => BibliographyFilter, {
    nullable: true,
    description: 'Filtrer etter alle typar bibliografiske kjelder.',
  })
  bibliography?: BibliographyFilter;

  @Field(() => [ArticleFilter], {
    nullable: true,
    description: 'Kombiner fleire filter med OG-logikk.',
  })
  AND?: ArticleFilter[];

  @Field(() => [ArticleFilter], {
    nullable: true,
    description: 'Kombiner fleire filter med ELLER-logikk.',
  })
  OR?: ArticleFilter[];

  @Field(() => ArticleFilter, {
    nullable: true,
    description: 'Negér eit filter.',
  })
  NOT?: ArticleFilter;
}

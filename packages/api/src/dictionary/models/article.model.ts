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
import { Dictionary } from './dictionary.model';
import { Definition } from './definition.model';
import { FlatDefinition } from './flat-definition.model';
import { WordClass } from './word-class.model';
import { Gender } from './gender.model';
import { Lemma } from './lemma.model';
import { RichContent } from './rich-content';
import { BibliographyReference } from './bibliography-reference.model';
import { Dialect } from './dialect';
import { WrittenForm } from './written-form';

@ObjectType({
  description:
    'Ein artikkel i eit leksikon eller ordbok, med detaljert informasjon om ord og bruken deira.',
})
export class Article {
  constructor(article?: Partial<Article>) {
    Object.assign(this, article);
  }

  @Field(() => Int, { description: 'Ein unik identifikator for artikkelen.' })
  id: number;

  @Field(() => Dictionary, { description: 'Ordboka som artikkelen tilhøyrer.' })
  dictionary: Dictionary;

  @Field(() => WordClass, {
    nullable: true,
    description: 'Ordklassen til ordet i artikkelen, om tilgjengeleg.',
  })
  wordClass?: WordClass;

  @Field(() => [Lemma], {
    nullable: true,
    description:
      'Liste over lemmaer (grunnformer av ord) som artikkelen omhandlar.',
  })
  lemmas?: Lemma[];

  @Field(() => Gender, {
    nullable: true,
    description: 'Kjønnet til ordet i artikkelen, om relevant.',
  })
  gender?: Gender;

  @Field(() => [Definition], {
    nullable: true,
    deprecationReason:
      'Bruk flatDefinitions i staden. Dette feltet skal tidlegast fjernast 2026-08-01.',
    description: 'Eit tre med definisjonar i artikkelen.',
  })
  definitions?: Definition[];

  @Field(() => [FlatDefinition], {
    nullable: true,
    description: 'Liste over definisjonar i artikkelen.',
  })
  flatDefinitions?: FlatDefinition[];

  @Field(() => [Article], {
    nullable: true,
    description:
      'Liste over artiklar som inkluderer denne artikkelen som ein del av eit uttrykk.',
  })
  phrases?: Article[];

  @Field(() => [RichContent], {
    nullable: true,
    description: 'Liste over etymologiske opphav til ordet i artikkelen.',
  })
  etymology?: RichContent[];

  @Field(() => [RichContent], {
    nullable: true,
    description:
      'Liste over uttalar av ordet i artikkelen. Tilgjengeleg for Norsk Ordbok.',
  })
  pronunciation?: RichContent[];

  @Field(() => [Dialect], {
    nullable: true,
    description:
      'Dialektinformasjon for ordet, med dialektformer frå ulike stader. Tilgjengeleg for Norsk Ordbok.',
  })
  dialect?: Dialect[];

  @Field(() => [WrittenForm], {
    nullable: true,
    description:
      'Historiske og alternative skriftformer av ordet. Tilgjengeleg for Norsk Ordbok.',
  })
  writtenForm?: WrittenForm[];

  @Field(() => [BibliographyReference], {
    nullable: true,
    description:
      'Referansar til eldre kjelder, som historiske ordbøker. Tilgjengeleg for Norsk Ordbok.',
  })
  olderSources?: BibliographyReference[];
}

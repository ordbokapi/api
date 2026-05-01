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
import { WordClass } from './word-class.model';
import { Gender } from './gender.model';
import { Lemma } from './lemma.model';
import { RichContent } from './rich-content';

@ObjectType({
  description:
    'Representerer ein artikkel i eit leksikon eller ordbok, med detaljert informasjon om ord og deira bruk.',
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
    description: 'Kjønn av ordet i artikkelen, om relevant.',
  })
  gender?: Gender;

  @Field(() => [Definition], {
    nullable: true,
    description: 'Liste over definisjonar av ordet i artikkelen.',
  })
  definitions?: Definition[];

  @Field(() => [Article], {
    nullable: true,
    description:
      'Liste over artiklar som inkluderar denne artikkelen som ein del av eit uttrykk.',
  })
  phrases?: Article[];

  @Field(() => [RichContent], {
    nullable: true,
    description: 'Liste over etymologiske opphav til ordet i artikkelen.',
  })
  etymology?: RichContent[];
}

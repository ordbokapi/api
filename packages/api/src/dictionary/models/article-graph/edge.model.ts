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
import { ArticleRelationshipType } from '../article-relationship';

@ObjectType({
  description: 'Representerer ein kant i ein graf av artikkelrelasjonar.',
})
export class ArticleGraphEdge {
  constructor(edge?: Partial<ArticleGraphEdge>) {
    Object.assign(this, edge);
  }

  @Field(() => Int, {
    description: 'Artikkelidentifikator for startnoden i kanten.',
  })
  sourceId: number;

  @Field(() => Int, {
    description: 'Artikkelidentifikator for sluttnoden i kanten.',
  })
  targetId: number;

  @Field(() => ArticleRelationshipType, {
    description: 'Typen til artikkelrelasjonen.',
  })
  type: ArticleRelationshipType;

  @Field(() => Int, {
    nullable: true,
    description:
      'Ein valfri unik identifikator for definisjonen der artikkelrelasjonen er definert, unik i forhold til artikkelen.',
  })
  sourceDefinitionId?: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Indeks for definisjonen der artikkelrelasjonen er definert, unik i forhold til artikkelen.',
  })
  sourceDefinitionIndex?: number;
}

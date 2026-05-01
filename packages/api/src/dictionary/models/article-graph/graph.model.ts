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

import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../article.model';
import { Dictionary } from '../dictionary.model';
import { ArticleGraphEdge } from './edge.model';

@ObjectType({
  description:
    'Representerer ein graf av artikkelrelasjonar, der kvar node er ein artikkel og kvar kant er ein artikkelrelasjon.',
})
export class ArticleGraph {
  constructor(graph?: Partial<ArticleGraph>) {
    Object.assign(this, graph);
  }

  @Field(() => Dictionary, {
    description: 'Ordboka som grafen er henta frå.',
  })
  dictionary: Dictionary;

  @Field(() => [Article], {
    description: 'Ei liste over artikkelane som er med i grafen.',
  })
  nodes: Article[] = [];

  @Field(() => [ArticleGraphEdge], {
    description:
      'Ei liste over artikkelidentifikatorar som er med i grafen, der kvar artikkelidentifikator er ein kant i grafen.',
  })
  edges: ArticleGraphEdge[] = [];
}

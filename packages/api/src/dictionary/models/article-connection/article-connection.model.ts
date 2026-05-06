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
import { ArticleEdge } from './article-edge.model';
import { PageInfo } from './page-info.model';
import { ArticleFacets } from './article-facets.model';

@ObjectType({
  description:
    'Resultatet av eit artikkelsøk, med paginering og valfrie aggregat.',
})
export class ArticleConnection {
  @Field(() => [ArticleEdge], { description: 'Kantane i tilkoplinga.' })
  edges: ArticleEdge[];

  @Field(() => PageInfo, { description: 'Pagineringsinformasjon.' })
  pageInfo: PageInfo;

  @Field(() => Int, { description: 'Estimert totalt tal på treff.' })
  totalCount: number;

  @Field(() => ArticleFacets, {
    nullable: true,
    description: 'Aggregerte tal over resultata, fordelt på ulike eigenskapar.',
  })
  facets?: ArticleFacets;
}

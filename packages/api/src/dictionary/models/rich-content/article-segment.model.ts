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
import { RichContentSegmentType } from './segment-type.model';
import { RichContentSegment } from './segment.model';
import { Article } from '../article.model';

@ObjectType({
  description:
    'Representerer eit segment av rich content med ein referanse til ein artikkel.',
  implements: [RichContentSegment],
})
export class RichContentArticleSegment implements RichContentSegment {
  constructor(segment?: Partial<Omit<RichContentArticleSegment, 'type'>>) {
    Object.assign(this, segment);
  }

  @Field(() => RichContentSegmentType, {
    description: 'Typen av rich content-segmentet.',
  })
  type: RichContentSegmentType.Article = RichContentSegmentType.Article;

  @Field(() => String, {
    description: 'Innhaldet i segmentet.',
  })
  content: string = '';

  @Field(() => Article, {
    description: 'Artikkelen som er referert til i segmentet.',
  })
  article: Article;

  @Field(() => Int, {
    nullable: true,
    description: 'ID-en til definisjonen i artikkelen som er referert til.',
  })
  definitionId?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Indeksen til definisjonen i artikkelen som er referert til.',
  })
  definitionIndex?: number;
}

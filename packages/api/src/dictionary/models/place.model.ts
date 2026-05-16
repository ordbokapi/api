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
import { PlaceType } from './place-type.model';

@ObjectType({
  description:
    'Ein geografisk stad, som ein kommune, eit landskap eller ein landsdel.',
})
export class Place {
  @Field(() => Int, { description: 'Ein unik identifikator for staden.' })
  id: number;

  @Field(() => String, { description: 'Namnet på staden.' })
  name: string;

  @Field(() => String, {
    nullable: true,
    description: 'Kortform eller kodeforkortinga for staden.',
  })
  code?: string;

  @Field(() => PlaceType, {
    nullable: true,
    description: 'Kva type geografisk stad det er.',
  })
  type?: PlaceType;

  parentId?: number | null;

  @Field(() => Place, {
    nullable: true,
    description: 'Overordna stad i hierarkiet.',
  })
  parent?: Place;

  @Field(() => [Place], {
    nullable: true,
    description: 'Underordna stader i hierarkiet.',
  })
  children?: Place[];

  @Field(() => String, {
    nullable: true,
    description: 'Kommunenummer, om relevant.',
  })
  municipalityNr?: string;
}

@ObjectType({
  description: 'Paginert kopling av geografiske stader.',
})
export class PlaceConnection {
  @Field(() => [Place], {
    description: 'Liste over stader.',
  })
  entries: Place[];

  @Field(() => Int, {
    description: 'Totalt tal på treff.',
  })
  totalCount: number;
}

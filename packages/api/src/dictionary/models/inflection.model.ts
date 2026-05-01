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

import { InflectionTag } from './inflection-tag.model';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Representerer bøyingsinformasjon for eit ord, inkludert bøyingsmerke og ordform.',
})
export class Inflection {
  @Field(() => [InflectionTag], {
    description: 'Liste av bøyingsmerke assosiert med ordet.',
  })
  tags: InflectionTag[];

  @Field(() => String, {
    nullable: true,
    description: 'Den spesifikke bøygde forma av ordet.',
  })
  wordForm?: string;
}

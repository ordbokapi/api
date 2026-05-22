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
import { PlaceTypeFilter } from './enum-filter.input';
import { StringFilter } from './string-filter.input';

@InputType({
  description:
    'Filter for geografiske stader. Nøyaktig eitt felt må vera sett.',
})
export class PlaceFilter {
  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter stadnamn.',
  })
  name?: StringFilter;

  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filtrer etter stadkode.',
  })
  code?: StringFilter;

  @Field(() => PlaceTypeFilter, {
    nullable: true,
    description: 'Filtrer etter stadtype.',
  })
  type?: PlaceTypeFilter;
}

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
import { Word } from './word.model';

@ObjectType({
  description:
    'Representerer ei gruppe ordforslag basert på ulike søkjekriterium.',
})
export class Suggestions {
  @Field(() => [Word], {
    description: 'Liste av ord som matchar søkjeordet.',
  })
  exact: Word[];

  @Field(() => [Word], {
    description: 'Liste av ord som er bøyingsformer av søkjeordet.',
  })
  inflections: Word[];

  @Field(() => [Word], {
    description: 'Liste av ord som er funne ved fritekstsøk på søkjeordet.',
  })
  freetext: Word[];

  @Field(() => [Word], {
    description: 'Liste av ord som liknar på søkjeordet.',
  })
  similar: Word[];
}

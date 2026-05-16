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
import { Place } from './place.model';

@ObjectType({
  description:
    'Ei geografisk heimfesting som viser kvar ei tyding eller bruksform er registrert i kjeldematerialet.',
})
export class GeographicAttestation {
  @Field(() => Place, {
    description: 'Staden som er heimfesta.',
  })
  place: Place;

  @Field(() => Boolean, {
    description:
      'Om staden er merkt som synleg i kjeldedata. I den offisielle nettstaden til Norsk Ordbok vert berre synlege stader viste i opplisting.',
  })
  visible: boolean;
}

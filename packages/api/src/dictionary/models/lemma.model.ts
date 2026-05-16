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
import { Paradigm } from './paradigm.model';

@ObjectType({
  description:
    'Grunnforma til eit ord, med tilhøyrande tyding og bøyingsparadigme.',
})
export class Lemma {
  @Field(() => Int, { description: 'Ein unik identifikator for lemmaet.' })
  id: number;

  @Field(() => String, { description: 'Grunnforma av ordet.' })
  lemma: string;

  @Field(() => Int, {
    deprecationReason:
      'Bruk homographNumber i staden. Dette feltet skal tidlegast fjernast 2026-08-01.',
    description: 'Numerisk referansenummer til betydinga av lemmaet.',
  })
  meaning: number;

  @Field(() => Int, {
    description:
      'Homografindeks som skil mellom identisk stava ord med ulik opphav og tyding.',
  })
  homographNumber: number;

  @Field(() => [Paradigm], {
    description: 'Liste over bøyingsparadigme knytte til lemmaet.',
  })
  paradigms: Paradigm[];

  @Field(() => Boolean, {
    description:
      'Om lemmaet er eit verb med kløyvd infinitiv med «-a» som ending.',
  })
  splitInfinitive: boolean;
}

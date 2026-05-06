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
import { RichContent } from './rich-content';

@ObjectType({
  description: 'Referanse til ei bibliografisk kjelde.',
})
export class BibliographyReference {
  @Field(() => Int, {
    description: 'Den bibliografiske identifikatoren.',
  })
  id: number;

  @Field(() => String, {
    description: 'Koden som identifiserer kjelda.',
  })
  code: string;

  @Field(() => String, {
    nullable: true,
    description: 'Forfattar(ar) av verket.',
  })
  author?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Tittelen på verket.',
  })
  title?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Utgjevingsår.',
  })
  year?: string;

  @Field(() => RichContent, {
    nullable: true,
    description: 'Nærare spesifikasjon, til dømes sidenummer eller sitat.',
  })
  spec?: RichContent;
}

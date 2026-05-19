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
import { RichContentSegmentType } from './segment-type.model';
import { RichContentSegment } from './segment.model';
import { BibliographyReference } from '../bibliography-reference.model';

@ObjectType({
  description:
    'Eit riktekstsegment med ein referanse til ei bibliografisk kjelde.',
  implements: [RichContentSegment],
})
export class RichContentBibliographySegment implements RichContentSegment {
  constructor(reference: BibliographyReference) {
    this.content = reference.spec
      ? `(${reference.code} ${reference.spec.textContent})`
      : `(${reference.code})`;
    this.reference = reference;
  }

  @Field(() => RichContentSegmentType, {
    description: 'Typen av segmentet.',
  })
  type: RichContentSegmentType.Bibliography =
    RichContentSegmentType.Bibliography;

  @Field(() => String, {
    description:
      'Innhaldet i segmentet, formatert med koden, t.d. «(GaraasenR 125)».',
  })
  content: string;

  @Field(() => BibliographyReference, {
    description: 'Den bibliografiske kjeldereferansen.',
  })
  reference: BibliographyReference;
}

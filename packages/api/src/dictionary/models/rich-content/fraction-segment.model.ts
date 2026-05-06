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

@ObjectType({
  description: 'Eit riktekstsegment med ein brøk.',
  implements: [RichContentSegment],
})
export class RichContentFractionSegment implements RichContentSegment {
  constructor(numerator: string, denominator: string, textContent: string) {
    this.content = textContent;
    this.numerator = numerator;
    this.denominator = denominator;
  }

  @Field(() => RichContentSegmentType, {
    description: 'Typen av segmentet.',
  })
  type: RichContentSegmentType.Fraction = RichContentSegmentType.Fraction;

  @Field(() => String, {
    description:
      'Innhaldet i segmentet, formatert som Unicode-brøk for rein tekst.',
  })
  content: string;

  @Field(() => String, {
    description: 'Teljaren i brøken.',
  })
  numerator: string;

  @Field(() => String, {
    description: 'Nemnaren i brøken.',
  })
  denominator: string;
}

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
import { WordClass } from '../word-class.model';
import { Gender } from '../gender.model';
import { EtymologyLanguage } from '../etymology-language.model';
import { PlaceType } from '../place-type.model';

@InputType({
  description: 'Filter for ordklasse. Nøyaktig eitt felt må vera sett.',
})
export class WordClassFilter {
  @Field(() => WordClass, {
    nullable: true,
    description: 'Eksakt treff på éin ordklasse.',
  })
  eq?: WordClass;

  @Field(() => [WordClass], {
    nullable: true,
    description: 'Verdien er ein av desse ordklassane.',
  })
  in?: WordClass[];
}

@InputType({
  description: 'Filter for grammatisk kjønn. Nøyaktig eitt felt må vera sett.',
})
export class GenderFilter {
  @Field(() => Gender, {
    nullable: true,
    description: 'Eksakt treff på eitt kjønn.',
  })
  eq?: Gender;

  @Field(() => [Gender], {
    nullable: true,
    description: 'Verdien er eitt av desse kjønna.',
  })
  in?: Gender[];
}

@InputType({
  description:
    'Filter for etymologisk opphavsspråk. Nøyaktig eitt felt må vera sett.',
})
export class EtymologyLanguageFilter {
  @Field(() => EtymologyLanguage, {
    nullable: true,
    description: 'Eksakt treff på eitt språk.',
  })
  eq?: EtymologyLanguage;

  @Field(() => [EtymologyLanguage], {
    nullable: true,
    description: 'Verdien er eitt av desse språka.',
  })
  in?: EtymologyLanguage[];
}

@InputType({
  description: 'Filter for stadtype. Nøyaktig eitt felt må vera sett.',
})
export class PlaceTypeFilter {
  @Field(() => PlaceType, {
    nullable: true,
    description: 'Eksakt treff på éin stadtype.',
  })
  eq?: PlaceType;

  @Field(() => [PlaceType], {
    nullable: true,
    description: 'Verdien er ein av desse stadtypane.',
  })
  in?: PlaceType[];
}

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

import { Injectable } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { WordService } from '../providers';
import { Dictionary, Word, WordClass } from '../models';

@Injectable()
@Resolver(() => Word)
export class WordResolver {
  constructor(private wordService: WordService) {}

  @Query(() => Word, {
    nullable: true,
    description:
      'Hentar eit spesifikt ord basert på ordteksten og ein valfri liste av ordbøker.',
  })
  async word(
    @Args('word', {
      type: () => String,
      description: 'Ordet som skal søkjast etter.',
    })
    word: string,
    @Args('dictionaries', {
      type: () => [Dictionary],
      defaultValue: Object.values(Dictionary),
      description:
        'Liste over ordbøker der søket skal utførast. Standardverdiane er Bokmålsordboka og Nynorskordboka.',
    })
    dictionaries: Dictionary[],
    @Args('wordClass', {
      type: () => WordClass,
      nullable: true,
      description:
        'Begrensar søket til å berre gjelda ord med denne ordklassen.',
    })
    wordClass: WordClass | undefined,
  ) {
    return this.wordService.getWord(word, dictionaries, wordClass);
  }
}

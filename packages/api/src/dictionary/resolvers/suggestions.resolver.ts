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
import { Resolver, Query, Args, Info } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  WordService,
  OrdboekeneApiSearchType as ApiSearchType,
} from '../providers';
import { Dictionary, Suggestions, Word, WordClass } from '../models';

@Injectable()
@Resolver(() => Word)
export class SuggestionsResolver {
  constructor(private wordService: WordService) {}

  @Query(() => Suggestions, {
    description:
      'Hentar forslag til ord basert på delvis ordtekst og valde ordbøker.',
  })
  async suggestions(
    @Args('word', {
      type: () => String,
      description: 'Den delvise ordteksten som det skal hentast forslag for.',
    })
    word: string,
    @Args('dictionaries', {
      type: () => [Dictionary],
      defaultValue: Object.values(Dictionary),
      description:
        'Liste over ordbøker som skal brukast for å generera forslag. Standardverdiane er Bokmålsordboka og Nynorskordboka.',
    })
    dictionaries: Dictionary[],
    @Args('maxCount', {
      type: () => Number,
      nullable: true,
      description: 'Begrensar talet på forslag som skal returnerast.',
    })
    maxCount: number | undefined,
    @Args('wordClass', {
      type: () => WordClass,
      nullable: true,
      description:
        'Begrensar forslaga til å berre gjelda ord med denne ordklassen.',
    })
    wordClass: WordClass | undefined,
    @Info() info: GraphQLResolveInfo,
  ) {
    const selections = info.fieldNodes[0].selectionSet?.selections;

    if (!selections) {
      return [];
    }

    let searchTypes: ApiSearchType = ApiSearchType.Any;

    for (const selection of selections) {
      if (selection.kind !== 'Field') {
        continue;
      }

      switch (selection.name.value) {
        case 'exact':
          searchTypes |= ApiSearchType.Exact;
          break;
        case 'freetext':
          searchTypes |= ApiSearchType.Freetext;
          break;
        case 'inflections':
          searchTypes |= ApiSearchType.Inflection;
          break;
        case 'similar':
          searchTypes |= ApiSearchType.Similar;
          break;
      }
    }

    return this.wordService.getSuggestions(
      word,
      dictionaries,
      searchTypes,
      maxCount,
      wordClass,
    );
  }
}

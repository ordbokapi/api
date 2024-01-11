import { Resolver, Query, Args, Info } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  WordService,
  OrdboekeneApiSearchType as ApiSearchType,
} from '../providers';
import { Dictionary, Suggestions, Word } from '../models';

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
      defaultValue: [Dictionary.Bokmaalsordboka, Dictionary.Nynorskordboka],
      description:
        'Liste over ordbøker som skal brukast for å generera forslag. Standardverdiane er Bokmålsordboka og Nynorskordboka.',
    })
    dictionaries: Dictionary[],
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

    return this.wordService.getSuggestions(word, dictionaries, searchTypes);
  }
}

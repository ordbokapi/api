import { Resolver, Query, Args } from '@nestjs/graphql';
import { WordService } from '../word.service';
import { Dictionary, Suggestions, Word } from '../models';

@Resolver(() => Word)
export class SuggestionsResolver {
  constructor(private wordService: WordService) {}

  @Query(() => Suggestions, {
    description:
      'Hentar forslag til ord basert på delvis ordtekst og valde ordbøker.',
  })
  async getSuggestions(
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
  ) {
    return this.wordService.getSuggestions(word, dictionaries);
  }
}

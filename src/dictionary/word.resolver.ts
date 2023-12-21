import { Resolver, Query, Args } from '@nestjs/graphql';
import { Word } from './models/word.model';
import { WordService } from './word.service';
import { Dictionary } from './models/dictionary.model';

@Resolver(() => Word)
export class WordResolver {
  constructor(private wordService: WordService) {}

  @Query(() => [Word])
  async getSuggestions(
    @Args('word', { type: () => String }) word: string,
    @Args('dictionaries', {
      type: () => [Dictionary],
      defaultValue: [Dictionary.Bokmaalsordboka, Dictionary.Nynorskordboka],
    })
    dictionaries: Dictionary[],
  ) {
    return this.wordService.getSuggestions(word, dictionaries);
  }

  @Query(() => Word)
  async getWord(
    @Args('word', { type: () => String }) word: string,
    @Args('dictionaries', {
      type: () => [Dictionary],
      defaultValue: [Dictionary.Bokmaalsordboka, Dictionary.Nynorskordboka],
    })
    dictionaries: Dictionary[],
  ) {
    return this.wordService.getWord(word, dictionaries);
  }
}

import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql';
import { WordService } from '../word.service';
import { Dictionary, Article, Word } from '../models';

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
      defaultValue: [Dictionary.Bokmaalsordboka, Dictionary.Nynorskordboka],
      description:
        'Liste over ordbøker der søket skal utførast. Standardverdiane er Bokmålsordboka og Nynorskordboka.',
    })
    dictionaries: Dictionary[],
  ) {
    return this.wordService.getWord(word, dictionaries);
  }

  @ResolveField(() => [Article], { nullable: true })
  async articles(@Parent() word: Word) {
    return (await this.wordService.getWord(word.word, word.dictionaries))
      ?.articles;
  }
}

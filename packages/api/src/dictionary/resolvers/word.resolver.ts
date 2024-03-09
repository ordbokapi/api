import { Injectable } from '@nestjs/common';
import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql';
import { WordService } from '../providers';
import { Dictionary, Article, Word, WordClass } from '../models';

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

  @ResolveField(() => [Article], { nullable: true })
  async articles(
    @Parent() word: Word,
    @Args('wordClass', {
      type: () => WordClass,
      nullable: true,
      description:
        'Begrensar artiklane til å berre gjelda ord med denne ordklassen.',
    })
    wordClass: WordClass | undefined,
  ) {
    return (
      await this.wordService.getWord(word.word, word.dictionaries, wordClass)
    )?.articles;
  }
}

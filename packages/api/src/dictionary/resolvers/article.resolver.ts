import { Injectable } from '@nestjs/common';
import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Args,
  Int,
} from '@nestjs/graphql';
import { WordService } from '../providers';
import {
  Article,
  Definition,
  WordClass,
  Gender,
  Lemma,
  Dictionary,
  ArticleRelationship,
  RichContent,
} from '../models';

@Injectable()
@Resolver(() => Article)
export class ArticleResolver {
  constructor(private wordService: WordService) {}

  @Query(() => Article, {
    description: 'Hentar artikkelen med eit gitt id.',
    nullable: true,
  })
  async article(
    @Args('id', {
      type: () => Int,
      description: 'Id-en til artikkelen som skal hentast.',
    })
    id: number,
    @Args('dictionary', {
      type: () => Dictionary,
      description: 'Ordboka som artikkelen skal hentast frå.',
    })
    dictionary: Dictionary,
  ) {
    return this.wordService.getArticle(id, dictionary);
  }

  @Query(() => Article, {
    description: 'Hentar ein tilfeldig artikkel frå ordboka.',
    nullable: true,
  })
  async randomArticle(
    @Args('dictionary', {
      type: () => Dictionary,
      description: 'Ordboka som artikkelen skal hentast frå.',
    })
    dictionary: Dictionary,
  ) {
    return this.wordService.getRandomArticle(dictionary);
  }

  @ResolveField(() => [Definition])
  async definitions(@Parent() article: Article) {
    return this.wordService.getDefinitions(article);
  }

  @ResolveField(() => WordClass)
  async wordClass(@Parent() article: Article) {
    return this.wordService.getWordClass(article);
  }

  @ResolveField(() => [Lemma])
  async lemmas(@Parent() article: Article) {
    return this.wordService.getLemmas(article);
  }

  @ResolveField(() => Gender, { nullable: true })
  async gender(@Parent() article: Article) {
    return this.wordService.getGender(article);
  }

  @ResolveField(() => [ArticleRelationship])
  async relationships(@Parent() article: Article) {
    return this.wordService.getRelationships(article);
  }

  @ResolveField(() => [Article])
  async phrases(@Parent() article: Article) {
    return this.wordService.getPhrases(article);
  }

  @ResolveField(() => [RichContent], { nullable: true })
  async etymology(@Parent() article: Article) {
    return this.wordService.getEtymology(article);
  }
}

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
} from '../models';

@Resolver(() => Article)
export class ArticleResolver {
  constructor(private wordService: WordService) {}

  @Query(() => Article, {
    description: 'Hentar artikkelen med eit gitt id.',
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
}

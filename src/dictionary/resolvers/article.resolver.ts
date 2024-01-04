import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { WordService } from '../word.service';
import { Article, Definition, WordClass, Gender, Lemma } from '../models';

@Resolver(() => Article)
export class ArticleResolver {
  constructor(private wordService: WordService) {}

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
}

import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Article } from './models/article.model';
import { Definition } from './models/definition.model';
import { WordService } from './word.service';
import { WordClass } from './models/word-class.model';
import { Paradigm } from './models/paradigm.model';
import { Gender } from './models/gender.model';

@Resolver(() => Article)
export class ArticleResolver {
  constructor(private wordService: WordService) {}

  @ResolveField('definitions', () => [Definition])
  async getDefinitions(@Parent() article: Article) {
    return this.wordService.getDefinitions(article);
  }

  @ResolveField('wordClass', () => WordClass)
  async getWordClass(@Parent() article: Article) {
    return this.wordService.getWordClass(article);
  }

  @ResolveField('paradigms', () => [Paradigm])
  async getParadigms(@Parent() article: Article) {
    return this.wordService.getParadigms(article);
  }

  @ResolveField('gender', () => Gender, { nullable: true })
  async getGender(@Parent() article: Article) {
    return this.wordService.getGender(article);
  }
}

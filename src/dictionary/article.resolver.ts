import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Article } from './models/article.model';
import { Definition } from './models/definition.model';
import { WordService } from './word.service';

@Resolver(() => Article)
export class ArticleResolver {
  constructor(private wordService: WordService) {}

  @ResolveField('definitions', () => [Definition])
  async getDefinitions(@Parent() article: Article) {
    // Fetch and return definitions for the article only if this field is requested
    return this.wordService.getDefinitions(article);
  }
}

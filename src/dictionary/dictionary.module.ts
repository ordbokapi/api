import { Module } from '@nestjs/common';
import { WordResolver } from './word.resolver';
import { WordService } from './word.service';
import { ArticleResolver } from './article.resolver';
import { ArticleCacheProvider } from './article-cache.provider';

@Module({
  providers: [WordResolver, WordService, ArticleResolver, ArticleCacheProvider],
  exports: [WordService],
})
export class DictionaryModule {}

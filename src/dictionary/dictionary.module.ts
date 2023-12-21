import { Module } from '@nestjs/common';
import { WordResolver } from './word.resolver';
import { WordService } from './word.service';
import { ArticleResolver } from './article.resolver';

@Module({
  providers: [WordResolver, WordService, ArticleResolver],
  exports: [WordService],
})
export class DictionaryModule {}

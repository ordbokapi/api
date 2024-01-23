import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../article.model';
import { ArticleRelationshipType } from './relationship-type.model';
import { ArticleRelationship } from './relationship.model';

@ObjectType({
  description:
    'Representerer ein grafkant frå ein artikkel til ein annan, der den første artikkelen er brukt i den andre.',
  implements: [ArticleRelationship],
})
export class UsageArticleRelationship implements ArticleRelationship {
  constructor(article: Article) {
    this.article = article;
  }

  @Field(() => Article, {
    description: 'Artikkelen som er relatert til.',
  })
  article: Article;

  @Field(() => ArticleRelationshipType, {
    description: 'Typen av artikkelrelasjonen.',
  })
  type: ArticleRelationshipType.Usage = ArticleRelationshipType.Usage;
}

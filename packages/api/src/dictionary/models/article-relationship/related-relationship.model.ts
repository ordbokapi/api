import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../article.model';
import { ArticleRelationshipType } from './relationship-type.model';
import { ArticleRelationship } from './relationship.model';

@ObjectType({
  description: 'Representerer ein grafkant frå ein artikkel til ein annan.',
  implements: [ArticleRelationship],
})
export class RelatedArticleRelationship implements ArticleRelationship {
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
  type: ArticleRelationshipType.Related = ArticleRelationshipType.Related;
}

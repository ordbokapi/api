import { Field, InterfaceType } from '@nestjs/graphql';
import { Article } from '../article.model';
import { ArticleRelationshipType } from './relationship-type.model';

@InterfaceType({
  description: 'Representerer ein grafkant frå ein artikkel til ein annan.',
})
export abstract class ArticleRelationship {
  @Field(() => Article, {
    description: 'Artikkelen som er relatert til.',
  })
  article: Article;

  @Field(() => ArticleRelationshipType, {
    description: 'Typen av artikkelrelasjonen.',
  })
  type: ArticleRelationshipType;
}

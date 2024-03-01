import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../article.model';
import { ArticleRelationshipType } from './relationship-type.model';
import { ArticleRelationship } from './relationship.model';

@ObjectType({
  description:
    'Representerer ein grafkant frå ein artikkel til ein annan, der den annan er eit uttrykk som den første artikkelen er ein del av.',
  implements: [ArticleRelationship],
})
export class PhraseArticleRelationship implements ArticleRelationship {
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
  type: ArticleRelationshipType.Phrase = ArticleRelationshipType.Phrase;
}

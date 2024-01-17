import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from './article.model';

@ObjectType({
  description:
    'Representerer ein grafkant frå ein artikkel til fleire andre artiklar som er relatert til han.',
})
export class ArticleRelationship {
  constructor(edge?: Partial<ArticleRelationship>) {
    Object.assign(this, edge);
  }

  @Field(() => String, {
    description: 'Ein brukarvennleg tekst som beskriv relasjonen.',
  })
  summary: string = '';

  @Field(() => [Article], {
    description: 'Artiklane som er relatert til kilden.',
  })
  articles: Article[] = [];
}

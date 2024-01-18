import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from './article.model';
import { RichContentSegment } from './rich-content-segment.model';

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
  content: string = '';

  @Field(() => [RichContentSegment], {
    description:
      'Ein brukarvennleg tekst som beskriv relasjonen, segmentert i rich content.',
  })
  richContent: RichContentSegment[] = [];

  @Field(() => [Article], {
    description: 'Artiklane som er relatert til kilden.',
  })
  articles: Article[] = [];
}

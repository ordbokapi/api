import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RichContentSegmentType } from './segment-type.model';
import { RichContentSegment } from './segment.model';
import { Article } from '../article.model';

@ObjectType({
  description:
    'Representerer eit segment av rich content med ein referanse til ein artikkel.',
  implements: [RichContentSegment],
})
export class RichContentArticleSegment implements RichContentSegment {
  constructor(segment?: Partial<Omit<RichContentArticleSegment, 'type'>>) {
    Object.assign(this, segment);
  }

  @Field(() => RichContentSegmentType, {
    description: 'Typen av rich content-segmentet.',
  })
  type: RichContentSegmentType.Article = RichContentSegmentType.Article;

  @Field(() => String, {
    description: 'Innhaldet i segmentet.',
  })
  content: string = '';

  @Field(() => Article, {
    description: 'Artikkelen som er referert til i segmentet.',
  })
  article: Article;

  @Field(() => Int, {
    nullable: true,
    description: 'ID-en til definisjonen i artikkelen som er referert til.',
  })
  definitionId?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Indeksen til definisjonen i artikkelen som er referert til.',
  })
  definitionIndex?: number;
}

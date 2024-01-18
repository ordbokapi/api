import { Field, ObjectType } from '@nestjs/graphql';
import { RichContentType } from './rich-content-type.model';
import { RichContentSegment } from './rich-content-segment.model';

@ObjectType({
  description:
    'Representerer eit segment av rich content med tekst som innhald.',
  implements: [RichContentSegment],
})
export class RichContentTextSegment implements RichContentSegment {
  constructor(segment?: string) {
    this.content = segment ?? '';
  }

  @Field(() => RichContentType, {
    description: 'Typen av rich content-segmentet.',
  })
  type: RichContentType = RichContentType.Text;

  @Field(() => String, {
    description: 'Innhaldet i segmentet.',
  })
  content: string = '';
}

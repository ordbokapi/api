import { Field, ObjectType } from '@nestjs/graphql';
import { RichContentSegmentType } from './segment-type.model';
import { RichContentSegment } from './segment.model';

@ObjectType({
  description:
    'Representerer eit segment av rich content med tekst som innhald.',
  implements: [RichContentSegment],
})
export class RichContentTextSegment implements RichContentSegment {
  constructor(segment?: string) {
    this.content = segment ?? '';
  }

  @Field(() => RichContentSegmentType, {
    description: 'Typen av rich content-segmentet.',
  })
  type: RichContentSegmentType.Text = RichContentSegmentType.Text;

  @Field(() => String, {
    description: 'Innhaldet i segmentet.',
  })
  content: string = '';
}

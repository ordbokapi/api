import { Field, InterfaceType } from '@nestjs/graphql';
import { RichContentSegmentType } from './segment-type.model';

@InterfaceType({
  description:
    'Representerer eit segment av rich content, som kan vera tekst eller ein referanse til ein artikkel.',
})
export abstract class RichContentSegment {
  @Field(() => RichContentSegmentType, {
    description: 'Typen av rich content-segmentet.',
  })
  type: RichContentSegmentType;

  @Field(() => String, {
    description: 'Innhaldet i segmentet.',
  })
  content: string;
}

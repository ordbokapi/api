import { Field, InterfaceType } from '@nestjs/graphql';
import { RichContentType } from './rich-content-type.model';

@InterfaceType({
  description:
    'Representerer eit segment av rich content, som kan vera tekst eller ein referanse til ein artikkel.',
})
export abstract class RichContentSegment {
  @Field(() => RichContentType, {
    description: 'Typen av rich content-segmentet.',
  })
  type: RichContentType;

  @Field(() => String, {
    description: 'Innhaldet i segmentet.',
  })
  content: string;
}

import { Field, ObjectType } from '@nestjs/graphql';
import { RichContentSegment } from './segment.model';

@ObjectType({
  description: 'Representerer tekstinnhaldet i ein artikkel.',
})
export class RichContent {
  constructor(segments?: RichContentSegment[]) {
    this.richContent = segments?.slice() ?? [];
  }

  @Field({
    description: 'Innhaldet i rein tekst.',
  })
  get textContent(): string {
    return this.richContent.reduce((acc, segment) => acc + segment.content, '');
  }

  @Field(() => [RichContentSegment], {
    description: 'Innhaldet i form av rich content-segmenter.',
  })
  richContent: RichContentSegment[];
}

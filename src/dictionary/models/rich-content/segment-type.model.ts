import { registerEnumType } from '@nestjs/graphql';

export enum RichContentSegmentType {
  Text = 'Text',
  Article = 'Article',
}

registerEnumType(RichContentSegmentType, {
  name: 'RichContentSegmentType',
  description: 'Typen av rich content-segmentet.',
});

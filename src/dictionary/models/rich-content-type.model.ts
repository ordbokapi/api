import { registerEnumType } from '@nestjs/graphql';

export enum RichContentType {
  Text = 'Text',
  Article = 'Article',
}

registerEnumType(RichContentType, {
  name: 'RichContentType',
  description: 'Typen av rich content-segmentet.',
});

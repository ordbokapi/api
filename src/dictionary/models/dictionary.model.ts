import { registerEnumType } from '@nestjs/graphql';

export enum Dictionary {
  Bokmaalsordboka = 'Bokmålsordboka',
  Nynorskordboka = 'Nynorskordboka',
}

registerEnumType(Dictionary, {
  name: 'Dictionary',
});

import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
  HankjoennHokjoenn = 'HankjoennHokjoenn', // Masculine/Feminine
  Hankjoenn = 'Hankjoenn', // Masculine
  Hokjoenn = 'Hokjoenn', // Feminine
  Inkjekjoenn = 'Inkjekjoenn', // Neuter
}

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Den grammatiske kjønnet til eit substantiv.',
});

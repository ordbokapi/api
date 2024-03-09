import { registerEnumType } from '@nestjs/graphql';
import { UibDictionary } from 'ordbokapi-common';

export enum Dictionary {
  Bokmaalsordboka = 'Bokmålsordboka',
  Nynorskordboka = 'Nynorskordboka',
  NorskOrdbok = 'Norsk Ordbok',
}

export const toUibDictionary = (dictionary: Dictionary): UibDictionary => {
  switch (dictionary) {
    case Dictionary.Bokmaalsordboka:
      return UibDictionary.Bokmål;
    case Dictionary.Nynorskordboka:
      return UibDictionary.Nynorsk;
    case Dictionary.NorskOrdbok:
      return UibDictionary.Norsk;
  }
};

export const fromUibDictionary = (dictionary: UibDictionary): Dictionary => {
  switch (dictionary) {
    case UibDictionary.Bokmål:
      return Dictionary.Bokmaalsordboka;
    case UibDictionary.Nynorsk:
      return Dictionary.Nynorskordboka;
    case UibDictionary.Norsk:
      return Dictionary.NorskOrdbok;
  }
};

registerEnumType(Dictionary, {
  name: 'Dictionary',
  description: 'Ei ordbok.',
});

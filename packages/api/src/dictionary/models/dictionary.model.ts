import { registerEnumType } from '@nestjs/graphql';
import { UiBDictionary } from 'ordbokapi-common';

export enum Dictionary {
  Bokmaalsordboka = 'Bokmålsordboka',
  Nynorskordboka = 'Nynorskordboka',
  NorskOrdbok = 'Norsk Ordbok',
}

export const toUibDictionary = (dictionary: Dictionary): UiBDictionary => {
  switch (dictionary) {
    case Dictionary.Bokmaalsordboka:
      return UiBDictionary.Bokmål;
    case Dictionary.Nynorskordboka:
      return UiBDictionary.Nynorsk;
    case Dictionary.NorskOrdbok:
      return UiBDictionary.Norsk;
  }
};

export const fromUibDictionary = (dictionary: UiBDictionary): Dictionary => {
  switch (dictionary) {
    case UiBDictionary.Bokmål:
      return Dictionary.Bokmaalsordboka;
    case UiBDictionary.Nynorsk:
      return Dictionary.Nynorskordboka;
    case UiBDictionary.Norsk:
      return Dictionary.NorskOrdbok;
  }
};

registerEnumType(Dictionary, {
  name: 'Dictionary',
  description: 'Ei ordbok.',
});

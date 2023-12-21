import { registerEnumType } from '@nestjs/graphql';

export enum WordClass {
  Substantiv = 'Substantiv', // Noun
  Adjektiv = 'Adjektiv', // Adjective
  Verb = 'Verb', // Verb
  Adverb = 'Adverb', // Adverb
  Pronomen = 'Pronomen', // Pronoun
  Preposisjon = 'Preposisjon', // Preposition
  Konjunksjon = 'Konjunksjon', // Conjunction
  Interjeksjon = 'Interjeksjon', // Interjection
}

registerEnumType(WordClass, {
  name: 'WordClass',
  description: 'Den grammatiske klassen til eit ord',
});

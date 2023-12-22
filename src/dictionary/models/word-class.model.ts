import { registerEnumType } from '@nestjs/graphql';

export enum WordClass {
  Substantiv = 'Substantiv', // Noun
  Adjektiv = 'Adjektiv', // Adjective
  Adverb = 'Adverb', // Adverb
  Verb = 'Verb', // Verb
  Pronomen = 'Pronomen', // Pronoun
  Preposisjon = 'Preposisjon', // Preposition
  Konjunksjon = 'Konjunksjon', // Conjunction
  Interjeksjon = 'Interjeksjon', // Interjection
  Determinativ = 'Determinativ', // Determiner
  Subjunksjon = 'Subjunksjon', // Subjunction
}

registerEnumType(WordClass, {
  name: 'WordClass',
  description: 'Den grammatiske klassen til eit ord',
});

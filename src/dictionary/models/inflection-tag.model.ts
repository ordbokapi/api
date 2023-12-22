import { registerEnumType } from '@nestjs/graphql';

export enum InflectionTag {
  Infinitiv = 'Infinitiv', // Infinitive
  Presens = 'Presens', // Present
  Preteritum = 'Preteritum', // Past
  PerfektPartisipp = 'PerfektPartisipp', // Perfect participle
  PresensPartisipp = 'PresensPartisipp', // Present participle
  Imperativ = 'Imperativ', // Imperative
  Passiv = 'Passiv', // Passive
  Adjektiv = 'Adjektiv', // Adjective
  Eintal = 'Eintal', // Singular
  HankjoennHokjoenn = 'HankjoennHokjoenn', // Masculine/Feminine
  Hankjoenn = 'Hankjoenn', // Masculine
  Hokjoenn = 'Hokjoenn', // Feminine
  Inkjekjoenn = 'Inkjekjoenn', // Neuter
  Ubestemt = 'Ubestemt', // Indefinite
  Bestemt = 'Bestemt', // Definite
  Fleirtal = 'Fleirtal', // Plural
}

registerEnumType(InflectionTag, {
  name: 'InflectionTag',
  description: 'Bøyingsmerke',
});

// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This file is part of Ordbok API.
//
// Ordbok API is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

import { registerEnumType } from '@nestjs/graphql';

export enum InflectionTag {
  Infinitiv = 'Infinitiv', // Infinitive
  Presens = 'Presens', // Present
  Preteritum = 'Preteritum', // Past
  PerfektPartisipp = 'PerfektPartisipp', // Perfect participle
  PresensPartisipp = 'PresensPartisipp', // Present participle
  SPassiv = 'SPassiv', // S-Passive
  Imperativ = 'Imperativ', // Imperative
  Passiv = 'Passiv', // Passive
  Adjektiv = 'Adjektiv', // Adjective
  Adverb = 'Adverb', // Adverb
  Eintal = 'Eintal', // Singular
  HankjoennHokjoenn = 'HankjoennHokjoenn', // Masculine/Feminine
  Hankjoenn = 'Hankjoenn', // Masculine
  Hokjoenn = 'Hokjoenn', // Feminine
  Inkjekjoenn = 'Inkjekjoenn', // Neuter
  Ubestemt = 'Ubestemt', // Indefinite
  Bestemt = 'Bestemt', // Definite
  Fleirtal = 'Fleirtal', // Plural
  Superlativ = 'Superlativ', // Superlative
  Komparativ = 'Komparativ', // Comparative
  Positiv = 'Positiv', // Positive
  Nominativ = 'Nominativ', // Nominative
  Akkusativ = 'Akkusativ', // Accusative
}

registerEnumType(InflectionTag, {
  name: 'InflectionTag',
  description: 'Bøyingsmerke for eit ord.',
});

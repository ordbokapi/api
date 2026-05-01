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
  Symbol = 'Symbol', // Symbol
  Forkorting = 'Forkorting', // Abbreviation
  Uttrykk = 'Uttrykk', // Phrase
}

registerEnumType(WordClass, {
  name: 'WordClass',
  description: 'Den grammatiske klassen til eit ord.',
});

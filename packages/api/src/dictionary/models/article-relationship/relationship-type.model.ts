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

export enum ArticleRelationshipType {
  Related = 'Relatert',
  SeeAlso = 'SjaaOg',
  Usage = 'Bruk',
  Synonym = 'Synonym',
  Antonym = 'Motsetning',
  Phrase = 'Uttrykk',
}

registerEnumType(ArticleRelationshipType, {
  name: 'ArticleRelationshipType',
  description: 'Typen av artikkelrelasjonen.',
  valuesMap: {
    Related: {
      description: 'Ein generisk relasjon mellom to artiklar.',
    },
    SeeAlso: {
      description:
        'Ei tilvising til ein annan artikkel som gjev meir informasjon eller er relatert på anna vis.',
    },
    Usage: {
      description: 'Ein relasjon der den eine artikkelen er bruka i den andre.',
    },
    Synonym: {
      description: 'Artiklane er synonyme.',
    },
    Antonym: {
      description: 'Artiklane er antonyme.',
    },
    Phrase: {
      description:
        'Den relaterte artikkelen er eit fast uttrykk som den fyrste artikkelen er ein del av.',
    },
  },
});

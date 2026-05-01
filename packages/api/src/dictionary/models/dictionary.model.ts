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

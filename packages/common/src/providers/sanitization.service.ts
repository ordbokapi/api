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

import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizationService {
  /**
   * Sanitizes a value for use in a search query. Sanitizes the value by
   * removing any characters that could be used to escape the query.
   * Alpha-numeric characters are allowed, as well as common punctuation, and
   * special characters and accents that are commonly used in Norwegian.
   * @param value The value to sanitize.
   * @returns The sanitized value.
   */
  sanitize(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9æøåÆØÅéèÉÈáàÁÀäÄöÖüÜß\- ]/g, '')
      .replace(/[\-]/g, '\\-');
  }
}

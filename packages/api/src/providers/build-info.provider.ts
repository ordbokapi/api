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

import { readFileSync } from 'fs';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BuildInfoProvider {
  #buildId: string;

  constructor() {
    const logger = new Logger(BuildInfoProvider.name);

    try {
      this.#buildId = readFileSync('dist/BUILD_HEAD', 'utf8')
        .trim()
        .substring(0, 7);
    } catch (error) {
      this.#buildId = 'unknown';
      logger.warn('Failed to read build info', error);
    }
  }

  get buildId(): string {
    return this.#buildId;
  }
}

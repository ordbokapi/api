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

import 'reflect-metadata';

export const DEV_ONLY_WATERMARK = Symbol('DEV_ONLY_WATERMARK');

/**
 * Decorator to mark a class as only available outside of production. This is
 * useful for classes that are only used for debugging or development purposes.
 */
export function DevOnly(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(DEV_ONLY_WATERMARK, true, target);
  };
}

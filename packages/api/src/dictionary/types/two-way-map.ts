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

export class TwoWayMap<L extends string | number, R extends string | number> {
  private map: Record<L, R> = {} as Record<L, R>;
  private reverseMap: Record<R, L> = {} as Record<R, L>;

  constructor(entries: [L, R][]) {
    entries.forEach(([left, right]) => {
      this.map[left] = right;
      this.reverseMap[right] = left;
    });
  }

  get(left: L): R {
    return this.map[left];
  }

  getReverse(right: R): L {
    return this.reverseMap[right];
  }

  has(left: string | number): left is L {
    return left in this.map;
  }

  hasReverse(right: string | number): right is R {
    return right in this.reverseMap;
  }

  getEntries(): [L, R][] {
    return Object.entries(this.map) as [L, R][];
  }

  getReverseEntries(): [R, L][] {
    return Object.entries(this.reverseMap) as [R, L][];
  }

  getKeys(): L[] {
    return Object.keys(this.map) as L[];
  }

  getReverseKeys(): R[] {
    return Object.keys(this.reverseMap) as R[];
  }

  getValues(): R[] {
    return Object.values(this.map) as R[];
  }

  getReverseValues(): L[] {
    return Object.values(this.reverseMap) as L[];
  }

  get size(): number {
    return Object.keys(this.map).length;
  }
}

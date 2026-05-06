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

import { describe, test, expect } from 'vitest';
import { flattenDefinitions } from './flatten-definitions';
import { Definition } from '../models';

function def(id: number, ...subDefinitions: Definition[]): Definition {
  const d = new Definition({ id });

  if (subDefinitions.length > 0) {
    d.subDefinitions = subDefinitions;
  }

  return d;
}

describe('flattenDefinitions', () => {
  test('returns empty array for empty input', () => {
    expect(flattenDefinitions([])).toEqual([]);
  });

  test('produces pre-order list', () => {
    const tree = [def(1, def(2, def(3)), def(4)), def(5)];

    const result = flattenDefinitions(tree);

    expect(result).toHaveLength(5);
    expect(result[0]).toMatchObject({ id: 1, parentIndex: undefined });
    expect(result[1]).toMatchObject({ id: 2, parentIndex: 0 });
    expect(result[2]).toMatchObject({ id: 3, parentIndex: 1 });
    expect(result[3]).toMatchObject({ id: 4, parentIndex: 0 });
    expect(result[4]).toMatchObject({ id: 5, parentIndex: undefined });
  });

  test('parentIndex always refers to an earlier index', () => {
    const tree = [
      def(1, def(2, def(3, def(4)), def(5)), def(6, def(7), def(8))),
      def(9, def(10, def(11))),
      def(12),
    ];

    const result = flattenDefinitions(tree);

    for (let i = 0; i < result.length; i++) {
      const { parentIndex } = result[i];

      if (parentIndex !== undefined) {
        expect(parentIndex).toBeLessThan(i);
      }
    }
  });
});

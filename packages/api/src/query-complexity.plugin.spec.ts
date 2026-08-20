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
import { buildSchema, parse } from 'graphql';
import { getComplexity } from 'graphql-query-complexity';
import { complexityEstimators } from './query-complexity.plugin';

const schema = buildSchema(`
  type Article {
    id: Int!
    phrases: [Article]
  }

  type Suggestions {
    articles(maxCount: Int): [Article]
  }

  type Query {
    article(id: Int!): Article
    suggestions(word: String!): Suggestions
  }
`);

const complexityOf = (query: string) =>
  getComplexity({
    schema,
    query: parse(query),
    estimators: complexityEstimators,
    maxQueryNodes: 10000,
  });

const nestedPhrases = (depth: number) => {
  let selection = 'id';

  for (let i = 0; i < depth; i++) {
    selection = `id phrases { ${selection} }`;
  }

  return `{ article(id: 1) { ${selection} } }`;
};

describe('query complexity estimators', () => {
  test('estimates shallow queries as cheap', () => {
    expect(complexityOf('{ article(id: 1) { id phrases { id } } }')).toBe(13);
  });

  test('estimate recursive nesting as expensive', () => {
    expect(complexityOf(nestedPhrases(4))).toBeGreaterThan(
      complexityOf(nestedPhrases(3)) * 9,
    );
    expect(complexityOf(nestedPhrases(6))).toBeGreaterThan(100000);
  });

  test('use an explicit limit argument as the list size', () => {
    expect(
      complexityOf(
        '{ suggestions(word: "a") { articles(maxCount: 2) { id } } }',
      ),
    ).toBeLessThan(
      complexityOf('{ suggestions(word: "a") { articles { id } } }'),
    );
  });

  test('cap limit arguments', () => {
    expect(
      complexityOf(
        '{ suggestions(word: "a") { articles(maxCount: 1000000) { id } } }',
      ),
    ).toBeLessThan(1000);
  });
});

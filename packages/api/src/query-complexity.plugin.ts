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

import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { GraphQLError, getNullableType, isListType } from 'graphql';
import {
  ComplexityEstimator,
  fieldExtensionsEstimator,
  getComplexity,
} from 'graphql-query-complexity';

export const listSizeEstimator: ComplexityEstimator = ({
  field,
  args,
  childComplexity,
}) => {
  if (!isListType(getNullableType(field.type))) {
    return childComplexity + 1;
  }

  const limit = ['first', 'last', 'maxCount', 'limit']
    .map((name) => args[name])
    .find((value) => typeof value === 'number' && Number.isFinite(value));

  const size = limit === undefined ? 10 : Math.min(Math.max(limit, 1), 100);

  return childComplexity * size + 1;
};

export const complexityEstimators: ComplexityEstimator[] = [
  fieldExtensionsEstimator(),
  listSizeEstimator,
];

@Plugin()
export class QueryComplexityPlugin implements ApolloServerPlugin {
  readonly #maxComplexity =
    Number.parseInt(process.env.GRAPHQL_MAX_COMPLEXITY ?? '', 10) || 100000;

  constructor(private readonly schemaHost: GraphQLSchemaHost) {}

  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const { schema } = this.schemaHost;
    const maxComplexity = this.#maxComplexity;

    return {
      async didResolveOperation({ request, document }) {
        let complexity: number;

        try {
          complexity = getComplexity({
            schema,
            query: document,
            operationName: request.operationName ?? undefined,
            variables: request.variables,
            estimators: complexityEstimators,
            maxQueryNodes: 10000,
          });
        } catch (error) {
          throw new GraphQLError(
            error instanceof Error
              ? error.message
              : 'Spørjinga kunne ikkje vurderast.',
            {
              extensions: { code: 'QUERY_TOO_COMPLEX', http: { status: 400 } },
            },
          );
        }

        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Spørjinga er for kompleks: ${complexity}. Høgste tillatne kompleksitet er ${maxComplexity}.`,
            {
              extensions: { code: 'QUERY_TOO_COMPLEX', http: { status: 400 } },
            },
          );
        }
      },
    };
  }
}

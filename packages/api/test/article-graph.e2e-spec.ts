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

import { describe, it, expect } from 'vitest';
import { gql } from './e2e-app';

describe('articleGraph query', () => {
  it('returns a graph with nodes and edges at depth 1', async () => {
    const data = await gql(`{
      articleGraph(id: 66381, dictionary: Bokmaalsordboka, depth: 1) {
        dictionary
        nodes { id dictionary lemmas { lemma } wordClass }
        edges { sourceId targetId type }
      }
    }`);
    const graph = data.articleGraph;
    expect(graph.dictionary).toBe('Bokmaalsordboka');
    expect(graph.nodes.length).toBeGreaterThan(1);
    expect(graph.edges.length).toBeGreaterThan(0);

    const nodeIds = new Set(graph.nodes.map((n: any) => n.id));
    expect(nodeIds.has(66381)).toBe(true);

    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.sourceId)).toBe(true);
      expect(nodeIds.has(edge.targetId)).toBe(true);
    }

    const validTypes = [
      'Related',
      'SeeAlso',
      'Usage',
      'Synonym',
      'Antonym',
      'Phrase',
    ];
    for (const edge of graph.edges) {
      expect(validTypes).toContain(edge.type);
    }
  });

  it('returns edges with sourceDefinitionId and sourceDefinitionIndex', async () => {
    const data = await gql(`{
      articleGraph(id: 66381, dictionary: Bokmaalsordboka, depth: 1) {
        edges { sourceId targetId type sourceDefinitionId sourceDefinitionIndex }
      }
    }`);
    const withDef = data.articleGraph.edges.filter(
      (e: any) => e.sourceDefinitionId != null,
    );
    expect(withDef.length).toBeGreaterThan(0);
  });

  it('returns phrase edges', async () => {
    const data = await gql(`{
      articleGraph(id: 66381, dictionary: Bokmaalsordboka, depth: 1) {
        edges { sourceId targetId type }
      }
    }`);
    const phraseEdges = data.articleGraph.edges.filter(
      (e: any) => e.type === 'Phrase',
    );
    expect(phraseEdges.length).toBeGreaterThan(0);
    for (const e of phraseEdges) {
      expect(e.sourceId).toBe(66381);
    }
  });

  it('returns empty graph when article does not exist', async () => {
    const data = await gql(`{
      articleGraph(id: 999999999, dictionary: Bokmaalsordboka, depth: 1) {
        nodes { id }
        edges { sourceId targetId type }
      }
    }`);
    expect(data.articleGraph.nodes).toEqual([]);
    expect(data.articleGraph.edges).toEqual([]);
  });
});

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

import { Definition, FlatDefinition } from '../models';

function innerFlat(
  definitions: Definition[],
  parentIndex?: number,
  flat: FlatDefinition[] = [],
): FlatDefinition[] {
  for (const definition of definitions) {
    const index = flat.length;
    const flatDef: FlatDefinition = {
      id: definition.id,
      parentIndex,
      content: definition.content,
      examples: definition.examples,
      relationships: definition.relationships,
      placeReferences: definition.placeReferences,
      literatureReferences: definition.literatureReferences,
    };
    flat.push(flatDef);

    if (definition.subDefinitions?.length) {
      innerFlat(definition.subDefinitions, index, flat);
    }
  }

  return flat;
}

/**
 * Flattens a tree of definitions into a list in pre-order traversal order.
 */
export function flattenDefinitions(
  definitions: Definition[],
): FlatDefinition[] {
  return innerFlat(definitions);
}

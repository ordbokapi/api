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
  pgTable,
  text,
  bigint,
  integer,
  jsonb,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const articles = pgTable(
  'articles',
  {
    dictionary: text('dictionary').notNull(),
    id: bigint('id', { mode: 'number' }).notNull(),
    data: jsonb('data').notNull(),
    primaryLemma: text('primary_lemma').notNull().default(''),
    revision: bigint('revision', { mode: 'number' }).notNull().default(0),
    updatedAt: text('updated_at').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    modifiedAt: timestamp('modified_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.dictionary, table.id] })],
);

export const dictionaryMetadata = pgTable(
  'dictionary_metadata',
  {
    dictionary: text('dictionary').notNull(),
    key: text('key').notNull(),
    data: jsonb('data').notNull(),
    modifiedAt: timestamp('modified_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.dictionary, table.key] })],
);

export const bibliography = pgTable('bibliography', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  code: text('code').notNull().default(''),
  author: text('author').notNull().default(''),
  title: text('title').notNull().default(''),
  year: text('year').notNull().default(''),
  fields: jsonb('fields').notNull().default([]),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const places = pgTable('places', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  placeName: text('place_name').notNull().default(''),
  placeNameFull: text('place_name_full').notNull().default(''),
  placeType: text('place_type').notNull().default(''),
  parentId: bigint('parent_id', { mode: 'number' }),
  placeOrder: integer('place_order').notNull().default(0),
  municipalityNr: text('municipality_nr'),
  weightThreshold: integer('weight_threshold').notNull().default(0),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

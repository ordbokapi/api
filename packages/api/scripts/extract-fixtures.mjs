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

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

const fixturesDir = join(import.meta.dirname, '../test/fixtures');

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgres://ordbokapi:password@localhost:5432/ordbokapi';
const meiliUrl = process.env.MEILI_URL ?? 'http://localhost:7700';
const meiliApiKey = process.env.MEILI_API_KEY ?? 'masterkey';

const seedArticles = {
  bm: [
    66381, // "vane"
    4719, // "basseng"
    20612, // "grafisk"
    33530, // "lagnad"
    33983, // "latin"
    37093, // "maritim"
    40381, // "nautisk"
  ],
  nn: [87267], // "vane"
  no: [
    166337, // "merg"
    194163, // "stjerneloden"
    266810, // "pund"
    354805, // "sardiniar"
  ],
};

async function meili(path, options = {}) {
  const res = await fetch(`${meiliUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${meiliApiKey}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`MeiliSearch ${path}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function findReferencedArticleIds(client, dictionary, articleId) {
  const { rows } = await client.query(
    `SELECT DISTINCT val::bigint AS ref_id FROM (
       SELECT jsonb_path_query(data, 'strict $.**.article_id')::text AS val
       FROM articles WHERE dictionary = $1 AND id = $2
     ) sub ORDER BY 1`,
    [dictionary, articleId],
  );
  return rows.map((r) => r.ref_id);
}

async function main() {
  await mkdir(fixturesDir, { recursive: true });

  const client = new pg.Client(databaseUrl);
  await client.connect();

  try {
    const allIds = {};
    for (const [dict, seedIds] of Object.entries(seedArticles)) {
      const expanded = new Set(seedIds);
      for (const id of seedIds) {
        const refs = await findReferencedArticleIds(client, dict, id);
        for (const ref of refs) expanded.add(ref);
      }
      allIds[dict] = [...expanded].sort((a, b) => a - b);
    }

    console.log('Article IDs to extract:');
    for (const [dict, ids] of Object.entries(allIds)) {
      console.log(`  ${dict}: ${ids.length} articles`);
    }

    const conditions = Object.entries(allIds)
      .map(
        ([dict, ids]) =>
          `(dictionary = '${dict}' AND id IN (${ids.join(',')}))`,
      )
      .join(' OR ');

    const { rows: articles } = await client.query(
      `SELECT json_agg(row_to_json(t)) AS data FROM (
         SELECT dictionary, id, data, primary_lemma, revision, updated_at
         FROM articles WHERE ${conditions}
         ORDER BY dictionary, id
       ) t`,
    );
    const articlesJson = articles[0].data;
    await writeFile(
      join(fixturesDir, 'articles.json'),
      JSON.stringify(articlesJson) + '\n',
    );
    console.log(`Wrote ${articlesJson.length} articles`);

    const { rows: meta } = await client.query(
      `SELECT json_agg(row_to_json(t)) AS data FROM (
         SELECT dictionary, key, data
         FROM dictionary_metadata ORDER BY dictionary, key
       ) t`,
    );
    const metaJson = meta[0].data;
    await writeFile(
      join(fixturesDir, 'metadata.json'),
      JSON.stringify(metaJson) + '\n',
    );
    console.log(`Wrote ${metaJson?.length ?? 0} metadata entries`);

    const settings = await meili('/indexes/articles-bm/settings');
    await writeFile(
      join(fixturesDir, 'meili-settings.json'),
      JSON.stringify(settings) + '\n',
    );
    console.log('Wrote MeiliSearch settings');

    const allDocs = [];
    for (const [dict, ids] of Object.entries(allIds)) {
      const meiliIds = ids.map((id) => `${dict}_${id}`);
      const result = await meili(`/indexes/articles-${dict}/documents/fetch`, {
        method: 'POST',
        body: JSON.stringify({ ids: meiliIds, limit: meiliIds.length }) + '\n',
      });
      allDocs.push(...(result.results ?? []));
    }
    await writeFile(
      join(fixturesDir, 'meili-documents.json'),
      JSON.stringify(allDocs) + '\n',
    );
    console.log(`Wrote ${allDocs.length} MeiliSearch documents`);

    console.log('\nFixtures written to', fixturesDir);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

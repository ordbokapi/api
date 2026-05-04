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
import { join } from 'path';
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import pg from 'pg';

const FIXTURES_DIR = join(__dirname, 'fixtures');

interface FixtureArticle {
  dictionary: string;
  id: number;
  data: Record<string, unknown>;
  primary_lemma: string;
  revision: number;
  updated_at: string;
}

interface FixtureMetadata {
  dictionary: string;
  key: string;
  data: Record<string, unknown>;
}

interface MeiliDocument {
  id: string;
  dictionary: string;
  [key: string]: unknown;
}

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf-8'));
}

async function waitForMeiliSearch(url: string, apiKey: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${url}/health`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) return;
    } catch {
      // Not ready yet.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('MeiliSearch did not become healthy');
}

async function meiliFetch(
  url: string,
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok && !('taskUid' in body)) {
    throw new Error(
      `MeiliSearch ${init?.method ?? 'GET'} ${path} failed: ${JSON.stringify(body)}`,
    );
  }
  return body;
}

async function meiliTask(
  url: string,
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<void> {
  const body = (await meiliFetch(url, apiKey, path, init)) as {
    taskUid: number;
  };
  for (let i = 0; i < 60; i++) {
    const task = (await meiliFetch(url, apiKey, `/tasks/${body.taskUid}`)) as {
      status: string;
      error?: unknown;
    };
    if (task.status === 'succeeded') return;
    if (task.status === 'failed') {
      throw new Error(
        `MeiliSearch task ${body.taskUid} failed: ${JSON.stringify(task.error)}`,
      );
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`MeiliSearch task ${body.taskUid} timed out`);
}

async function seedPostgres(connectionString: string): Promise<void> {
  const client = new pg.Client(connectionString);
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        dictionary TEXT NOT NULL,
        id BIGINT NOT NULL,
        data JSONB NOT NULL,
        primary_lemma TEXT NOT NULL DEFAULT '',
        revision BIGINT NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        modified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (dictionary, id)
      );
      CREATE TABLE IF NOT EXISTS dictionary_metadata (
        dictionary TEXT NOT NULL,
        key TEXT NOT NULL,
        data JSONB NOT NULL,
        modified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (dictionary, key)
      );
    `);

    const articles = loadFixture<FixtureArticle[]>('articles.json');
    for (const a of articles) {
      await client.query(
        `INSERT INTO articles (dictionary, id, data, primary_lemma, revision, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (dictionary, id) DO NOTHING`,
        [
          a.dictionary,
          a.id,
          JSON.stringify(a.data),
          a.primary_lemma,
          a.revision,
          a.updated_at,
        ],
      );
    }

    const metadata = loadFixture<FixtureMetadata[] | null>('metadata.json');
    if (metadata) {
      for (const m of metadata) {
        await client.query(
          `INSERT INTO dictionary_metadata (dictionary, key, data)
           VALUES ($1, $2, $3)
           ON CONFLICT (dictionary, key) DO NOTHING`,
          [m.dictionary, m.key, JSON.stringify(m.data)],
        );
      }
    }
  } finally {
    await client.end();
  }
}

async function seedMeiliSearch(url: string, apiKey: string): Promise<void> {
  const settings = loadFixture<Record<string, unknown>>('meili-settings.json');
  const documents = loadFixture<MeiliDocument[]>('meili-documents.json');

  const byDict = new Map<string, MeiliDocument[]>();
  for (const doc of documents) {
    const dict = doc.dictionary;
    if (!byDict.has(dict)) byDict.set(dict, []);
    byDict.get(dict)!.push(doc);
  }

  const settingsToApply = Object.fromEntries(
    Object.entries(settings).filter(([k]) => k !== 'displayedAttributes'),
  );

  for (const [dict, docs] of byDict) {
    const indexUid = `articles-${dict}`;

    await meiliTask(url, apiKey, '/indexes', {
      method: 'POST',
      body: JSON.stringify({ uid: indexUid, primaryKey: 'id' }),
    });

    await meiliTask(url, apiKey, `/indexes/${indexUid}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settingsToApply),
    });

    await meiliTask(url, apiKey, `/indexes/${indexUid}/documents`, {
      method: 'POST',
      body: JSON.stringify(docs),
    });
  }
}

export interface TestInfrastructure {
  pgContainer: StartedPostgreSqlContainer;
  meiliContainer: StartedTestContainer;
  databaseUrl: string;
  meiliUrl: string;
  meiliApiKey: string;
}

export async function startTestInfrastructure(): Promise<TestInfrastructure> {
  const meiliApiKey = 'test-master-key';

  const [pgContainer, meiliContainer] = await Promise.all([
    new PostgreSqlContainer('postgres:18-alpine')
      .withUsername('ordbokapi')
      .withPassword('testpassword')
      .withDatabase('ordbokapi')
      .start(),
    new GenericContainer('getmeili/meilisearch:v1')
      .withEnvironment({
        MEILI_MASTER_KEY: meiliApiKey,
        MEILI_ENV: 'development',
      })
      .withExposedPorts(7700)
      .withWaitStrategy(Wait.forListeningPorts())
      .start(),
  ]);

  const databaseUrl = pgContainer.getConnectionUri();

  const meiliPort = meiliContainer.getMappedPort(7700);
  const meiliHost = meiliContainer.getHost();
  const meiliUrl = `http://${meiliHost}:${meiliPort}`;

  await waitForMeiliSearch(meiliUrl, meiliApiKey);

  await Promise.all([
    seedPostgres(databaseUrl),
    seedMeiliSearch(meiliUrl, meiliApiKey),
  ]);

  return { pgContainer, meiliContainer, databaseUrl, meiliUrl, meiliApiKey };
}

export async function stopTestInfrastructure(
  infra: TestInfrastructure,
): Promise<void> {
  await Promise.all([infra.pgContainer.stop(), infra.meiliContainer.stop()]);
}

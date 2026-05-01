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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from '../db/schema';

export type Database = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService {
  constructor(private readonly config: ConfigService) {
    const url =
      this.config.get<string>('DATABASE_URL') ||
      'postgres://localhost:5432/ordbokapi';

    this.#pool = new pg.Pool({ connectionString: url });
    this.#db = drizzle(this.#pool, { schema });
  }

  readonly #pool: pg.Pool;
  readonly #db: Database;

  #logger = new Logger(DatabaseService.name);

  get db(): Database {
    return this.#db;
  }

  async onModuleInit(): Promise<void> {
    // Verify connection
    const client = await this.#pool.connect();
    client.release();
    this.#logger.log('Connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.#pool.end();
    this.#logger.log('Disconnected from PostgreSQL');
  }
}

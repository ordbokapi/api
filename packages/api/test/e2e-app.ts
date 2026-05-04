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

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';

let app: INestApplication | undefined;
let appPromise: Promise<INestApplication> | undefined;

export async function getApp(): Promise<INestApplication> {
  if (app) {
    return app;
  }

  if (appPromise) {
    return appPromise;
  }

  appPromise = (async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    return app;
  })();

  return appPromise;
}

export async function gql(
  query: string,
  variables?: Record<string, unknown>,
): Promise<Record<string, any>> {
  const a = await getApp();
  const res = await request(a.getHttpServer())
    .post('/graphql')
    .send({ query, variables });

  if (res.body.errors) {
    const msgs = res.body.errors.map((e: any) => e.message).join('\n');

    throw new Error(`GraphQL errors:\n${msgs}`);
  }

  return res.body.data;
}

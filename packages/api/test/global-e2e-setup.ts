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
  startTestInfrastructure,
  stopTestInfrastructure,
  type TestInfrastructure,
} from './test-infrastructure';

let infra: TestInfrastructure;

export async function setup() {
  infra = await startTestInfrastructure();
  process.env.DATABASE_URL = infra.databaseUrl;
  process.env.MEILI_URL = infra.meiliUrl;
  process.env.MEILI_API_KEY = infra.meiliApiKey;
}

export async function teardown() {
  if (infra) await stopTestInfrastructure(infra);
}

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

// read template.env and create .env while filling in the necessary values in
// template variables (e.g. {{ redis_port }})

import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const rootDir = path.dirname(new URL(import.meta.url).pathname);

const rootEnvPath = path.join(rootDir, '.env');
const templateEnvPath = path.join(rootDir, 'template.env');

const randBetween = (min, max) => crypto.randomInt(min, max + 1);

const randPassword = (length = 32) => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(
    crypto.randomBytes(length),
    (b) => chars[b % chars.length],
  ).join('');
};

const vars = {
  postgres_port: randBetween(49152, 65535),
  postgres_password: randPassword(),
  meili_port: randBetween(49152, 65535),
  meili_api_key: randPassword(),
  redis_port: randBetween(49152, 65535),
};

const templateEnv = await fs.readFile(templateEnvPath, 'utf-8');

const env = templateEnv.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => {
  if (varName in vars) return vars[varName];
  throw new Error(`Unknown variable: ${varName}`);
});

await fs.writeFile(rootEnvPath, env);

console.log('Oppretta .env frå template.env. Fyll ut med nødvendige verdiar.');

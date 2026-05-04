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

import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'ordbokapi-common': resolve(__dirname, '../common/src/index.ts'),
    },
    dedupe: [
      '@nestjs/common',
      '@nestjs/config',
      '@nestjs/core',
      'reflect-metadata',
    ],
  },
  oxc: {
    decorator: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
  },
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['test/global-e2e-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    maxWorkers: 1,
    isolate: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
  },
});

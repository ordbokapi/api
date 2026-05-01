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

import { promises as fs } from 'fs';
import path from 'path';

// makes a link to the .env file in the root in each package directory in the
// monorepo (packages/*) so that each package can access the same environment
// variables

const rootDir = path.dirname(new URL(import.meta.url).pathname);

const rootEnvPath = path.join(rootDir, '.env');
const packagesPath = path.join(rootDir, 'packages');

// create .env if it doesn't exist

try {
  await fs.access(rootEnvPath);
} catch (err) {
  if (err.code === 'ENOENT') {
    if (process.env.NODE_ENV === 'production') {
      process.exit(0); // don't create .env in production
    }

    await import('./writeenv.mjs');
  } else {
    throw err;
  }
}

const packageDirs = await fs.readdir(packagesPath, { withFileTypes: true });

for (const packageDir of packageDirs) {
  if (!packageDir.isDirectory()) continue;

  const packageEnvPath = path.join(packagesPath, packageDir.name, '.env');

  try {
    await fs.unlink(packageEnvPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  await fs.symlink(rootEnvPath, packageEnvPath);

  const relativePath = path.relative(rootDir, packageEnvPath);
  console.log(`Laga lenkje frå ${relativePath} til .env`);
}

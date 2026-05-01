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

import { copyFile, mkdir, writeFile, readFile } from 'fs/promises';
import * as process from 'process';

await mkdir('dist', { recursive: true });

try {
  await copyFile('../../.git/ORIG_HEAD', 'dist/BUILD_HEAD');

  console.log(
    `Build head ${await readFile('dist/BUILD_HEAD', 'utf8')} written to dist/BUILD_HEAD`,
  );
} catch (error) {
  if (error.code === 'ENOENT') {
    const sourceCommit =
      process.env.SOURCE_COMMIT || process.env.SOURCE_VERSION;
    if (sourceCommit) {
      await writeFile('dist/BUILD_HEAD', sourceCommit);

      console.log(`Build head ${sourceCommit} written to dist/BUILD_HEAD`);
    } else {
      console.warn('The file .git/ORIG_HEAD does not exist.');
    }
  } else {
    console.error('An error occurred while copying the file:', error);
  }
}

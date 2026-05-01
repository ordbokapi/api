#!/usr/bin/env node

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

// run tsc --build --watch tsconfig.build.json in the cwd and run the passed
// command when the build is done (when Found 0 errors. Watching for file
// changes. is printed to stdout)

import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import process from 'node:process';
import kill from 'tree-kill';

const cwd = process.cwd();
const tscConfigPath = join(cwd, 'tsconfig.build.json');
const tscArgs = ['tsc', '--build', '--watch', '--pretty', tscConfigPath];
const command = process.argv.slice(2);

const tsc = spawn('yarn', tscArgs, {
  stdio: ['ignore', 'pipe', 'inherit'],
  cwd,
});

let proc;

const startCommand = () => {
  proc && kill(proc.pid);
  proc = spawn(command[0], command.slice(1), { stdio: 'inherit', cwd });
};

const rl = createInterface({
  input: tsc.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  console.log(line);
  if (line.includes('Found 0 errors. Watching for file changes.')) {
    startCommand();
  }
});

tsc.on('exit', (code) => {
  console.log('tsc exited with code', code);
  proc && kill(proc.pid);
  process.exit(code);
});

process.on('SIGINT', () => {
  kill(tsc.pid);
  proc && kill(proc.pid);
  process.exit(0);
});

process.on('exit', () => {
  kill(tsc.pid);
  proc && kill(proc.pid);
});

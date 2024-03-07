#!/usr/bin/env node

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

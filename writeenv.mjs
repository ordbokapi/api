// read template.env and create .env while filling in the necessary values in
// template variables (e.g. {{ redis_port }})

import { promises as fs } from 'fs';
import path from 'path';

const rootDir = path.dirname(new URL(import.meta.url).pathname);

const rootEnvPath = path.join(rootDir, '.env');
const templateEnvPath = path.join(rootDir, 'template.env');

const randBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const vars = {
  redis_port: randBetween(49152, 65535),
  redis_insight_port: randBetween(49152, 65535),
};

const templateEnv = await fs.readFile(templateEnvPath, 'utf-8');

const env = templateEnv.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => {
  if (varName in vars) return vars[varName];
  throw new Error(`Unknown variable: ${varName}`);
});

await fs.writeFile(rootEnvPath, env);

console.log('Oppretta .env frå template.env. Fyll ut med nødvendige verdiar.');

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

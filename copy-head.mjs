import { copyFile, mkdir } from 'fs/promises';

await mkdir('dist', { recursive: true });
await copyFile('.git/ORIG_HEAD', 'dist/BUILD_HEAD');

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
    if (process.env.SOURCE_VERSION) {
      await writeFile('dist/BUILD_HEAD', process.env.SOURCE_VERSION);

      console.log(
        `Build head ${process.env.SOURCE_VERSION} written to dist/BUILD_HEAD`,
      );
    } else {
      console.warn('The file .git/ORIG_HEAD does not exist.');
    }
  } else {
    console.error('An error occurred while copying the file:', error);
  }
}

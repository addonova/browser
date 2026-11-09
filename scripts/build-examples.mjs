import { access, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, stop } from 'guchho';

const root = fileURLToPath(new URL('../', import.meta.url));
const examples = ['chrome', 'edge', 'firefox'];
const targets = {
  chrome: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
};

try {
  await access(path.join(root, 'dist/index.js'));
} catch {
  throw new Error('Run "npm run build" before building the examples.');
}

try {
  for (const example of examples) {
    const exampleDir = path.join(root, 'examples', example);
    const outdir = path.join(exampleDir, 'dist');

    await rm(outdir, { recursive: true, force: true });

    await build({
      absWorkingDir: root,
      entrypoints: [path.join(exampleDir, 'src/background.ts')],
      outdir,
      format: 'esm',
      platform: 'browser',
      bundle: true,
      splitting: false,
      treeShaking: true,
      metafile: true,
      alias: {
        '@addonova/browser': path.join(
          root,
          'dist/entries',
          `${targets[example]}.js`,
        ),
      },
      logLevel: 'silent',
    });

    await copyFile(
      path.join(exampleDir, 'manifest.json'),
      path.join(outdir, 'manifest.json'),
    );
    await access(path.join(outdir, 'background.js'));

    console.log(`Built examples/${example}`);
  }
} finally {
  await stop();
}

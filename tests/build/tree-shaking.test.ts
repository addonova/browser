import { afterAll, describe, expect, it } from '@guchho/test';
import { build, stop } from 'guchho';
import type { BuildOptions, BuildResult } from 'guchho';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixtures = path.join(root, 'tests/build/fixtures');
const dist = path.join(root, 'dist');

const ALL_ADAPTERS = [
  'adapters/chrome/index.js',
  'adapters/chromium/index.js',
  'adapters/edge/index.js',
  'adapters/firefox/index.js',
] as const;

type Target = 'chrome' | 'chromium' | 'edge' | 'firefox' | 'runtime';

function aliasFor(target: Target): Record<string, string> {
  const entry =
    target === 'runtime'
      ? path.join(dist, 'index.js')
      : path.join(dist, 'entries', `${target}.js`);

  return { '@addonova/browser': entry };
}

async function bundle(
  fixture: string,
  target: Target,
  options: Partial<BuildOptions> = {},
): Promise<BuildResult> {
  return build({
    absWorkingDir: root,
    entrypoints: [path.join(fixtures, `${fixture}.ts`)],
    outdir: path.join(root, 'dist/build-test'),
    format: 'esm',
    platform: 'browser',
    bundle: true,
    splitting: false,
    treeShaking: true,
    metafile: true,
    write: false,
    alias: aliasFor(target),
    logLevel: 'silent',
    ...options,
  });
}

function inputs(result: BuildResult): string[] {
  return (result.inputs ?? []).map((input) =>
    input.path.replace(/\\/g, '/'),
  );
}

function has(result: BuildResult, file: string): boolean {
  return inputs(result).some((input) => input.endsWith(file));
}

function text(result: BuildResult): string {
  const files = result.outputFiles as
    | Array<{ readonly text: string }>
    | undefined;
  const file = files?.[0];

  if (file === undefined) {
    throw new Error('The build produced no output file.');
  }

  return file.text;
}

let counter = 0;

async function execute(
  result: BuildResult,
): Promise<Record<string, unknown>> {
  counter += 1;
  const url = `data:text/javascript;base64,${Buffer.from(text(result)).toString('base64')}#${counter}`;

  return import(url) as Promise<Record<string, unknown>>;
}

interface ChromeEnvironment {
  readonly listeners: unknown[];
}

function installChrome(): ChromeEnvironment {
  const listeners: unknown[] = [];
  const event = {
    addListener(listener: unknown): void {
      listeners.push(listener);
    },
    removeListener(): void {},
  };

  (globalThis as Record<string, unknown>).chrome = {
    runtime: {
      id: 'build-test',
      getManifest: () => ({ manifest_version: 3 }),
    },
    tabs: {
      query: (_info: unknown, callback: (tabs: unknown[]) => void) => {
        callback([{ id: 1 }]);
      },
      onCreated: event,
    },
  };

  return { listeners };
}

function removeChrome(): void {
  delete (globalThis as Record<string, unknown>).chrome;
}

afterAll(async () => {
  await stop();
});

describe('build-time browser selection', () => {
  it('keeps the shared Chromium implementation for Chrome', async () => {
    const result = await bundle('tabs', 'chrome');

    expect(has(result, 'adapters/chrome/index.js')).toBe(true);
    expect(has(result, 'adapters/chromium/index.js')).toBe(true);
    expect(has(result, 'adapters/firefox/index.js')).toBe(false);
    expect(has(result, 'adapters/edge/index.js')).toBe(false);
    expect(has(result, 'browser/resolve.js')).toBe(false);
  });

  it('keeps only Firefox implementations for Firefox', async () => {
    const result = await bundle('tabs', 'firefox');

    expect(has(result, 'adapters/firefox/index.js')).toBe(true);
    expect(has(result, 'adapters/chrome/index.js')).toBe(false);
    expect(has(result, 'adapters/chromium/index.js')).toBe(false);
    expect(has(result, 'adapters/edge/index.js')).toBe(false);
    expect(has(result, 'browser/resolve.js')).toBe(false);
  });

  it('reuses Chromium for Edge without pulling Chrome or Firefox', async () => {
    const result = await bundle('combined', 'edge');

    expect(has(result, 'adapters/edge/index.js')).toBe(true);
    expect(has(result, 'adapters/chromium/index.js')).toBe(true);
    expect(has(result, 'adapters/chrome/index.js')).toBe(false);
    expect(has(result, 'adapters/firefox/index.js')).toBe(false);
  });
});

describe('API-level tree shaking', () => {
  it('drops unused API modules from a Chrome build', async () => {
    const result = await bundle('tabs', 'chrome');

    expect(has(result, 'api/tabs/index.js')).toBe(true);
    expect(has(result, 'api/storage/index.js')).toBe(false);
    expect(has(result, 'api/bookmarks/index.js')).toBe(false);
    expect(has(result, 'api/downloads/index.js')).toBe(false);
    expect(has(result, 'api/notifications/index.js')).toBe(false);
    expect(has(result, 'api/cookies/index.js')).toBe(false);
  });

  it('keeps used API modules and drops the rest in a runtime build', async () => {
    const result = await bundle('combined', 'runtime');

    expect(has(result, 'api/tabs/index.js')).toBe(true);
    expect(has(result, 'api/storage/index.js')).toBe(true);
    expect(has(result, 'api/bookmarks/index.js')).toBe(false);
    expect(has(result, 'api/downloads/index.js')).toBe(false);
    expect(has(result, 'api/notifications/index.js')).toBe(false);
  });

  it('retains runtime adapter resolution without a build-time target', async () => {
    const result = await bundle('tabs', 'runtime');

    for (const adapter of ALL_ADAPTERS) {
      expect(has(result, adapter)).toBe(true);
    }

    expect(has(result, 'browser/resolve.js')).toBe(true);
  });

  it('does not remove dynamically accessed APIs', async () => {
    const result = await bundle('dynamic', 'runtime');

    expect(has(result, 'api/browser.js')).toBe(true);
    expect(has(result, 'api/tabs/index.js')).toBe(true);
    expect(has(result, 'api/storage/index.js')).toBe(true);
    expect(has(result, 'api/bookmarks/index.js')).toBe(true);
    expect(has(result, 'api/downloads/index.js')).toBe(true);
  });
});

describe('bundle behavior', () => {
  it('executes a runtime bundle using the discovered extension API', async () => {
    const environment = installChrome();

    try {
      const result = await bundle('runtime', 'runtime');
      const module = await execute(result);
      const run = module.run as () => Promise<number>;

      await expect(run()).resolves.toBe(1);
      expect(environment.listeners).toHaveLength(0);
    } finally {
      removeChrome();
    }
  });

  it('keeps event listeners working in the generated bundle', async () => {
    const environment = installChrome();

    try {
      const result = await bundle('events', 'runtime');
      const module = await execute(result);
      const watch = module.watch as () => void;

      watch();
      expect(environment.listeners).toHaveLength(1);
    } finally {
      removeChrome();
    }
  });

  it('keeps the selected implementation working after minification', async () => {
    const environment = installChrome();

    try {
      const unminified = await bundle('tabs', 'chrome');
      const minified = await bundle('tabs', 'chrome', { minify: true });

      expect(has(minified, 'adapters/firefox/index.js')).toBe(false);
      expect(has(minified, 'api/storage/index.js')).toBe(false);
      expect(text(minified).length).toBeLessThan(text(unminified).length);

      const module = await execute(minified);
      const run = module.run as () => Promise<number>;

      await expect(run()).resolves.toBe(1);
      expect(environment.listeners).toHaveLength(0);
    } finally {
      removeChrome();
    }
  });
});

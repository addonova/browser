import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createStorageApi } from '../../src/api/storage/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import { createFakeBrowser } from '../../src/testing/fake-browser.ts';

function createFixture() {
  const fake = createFakeBrowser();
  const adapter = createChromeAdapter({
    api: fake,
    manifestVersion: 3,
  });

  return {
    fake,
    storage: createStorageApi(adapter),
  };
}

describe('typed storage items', () => {
  it('returns a fallback without writing it to storage', async () => {
    const { fake, storage } = createFixture();
    const item = storage.defineItem('theme', {
      fallback: { mode: 'light' },
    });

    await expect(item.getValue()).resolves.toEqual({ mode: 'light' });
    await expect(fake.storage.local.get()).resolves.toEqual({});
  });

  it('stores, reads, and removes values', async () => {
    const { storage } = createFixture();
    const item = storage.defineItem<number>('count', { fallback: 0 });

    await item.setValue(3);
    await expect(item.getValue()).resolves.toBe(3);

    await item.setValue(5);
    await expect(item.getValue()).resolves.toBe(5);

    await item.removeValue();
    await expect(item.getValue()).resolves.toBe(0);
  });

  it('initializes missing values once and persists them', async () => {
    const { fake, storage } = createFixture();
    let calls = 0;
    const item = storage.defineItem('created', {
      async init() {
        calls += 1;
        return { createdAt: 123 };
      },
    });

    await expect(item.getValue()).resolves.toEqual({ createdAt: 123 });
    await expect(item.getValue()).resolves.toEqual({ createdAt: 123 });
    expect(calls).toBe(1);
    await expect(fake.storage.local.get('created')).resolves.toEqual({
      created: { createdAt: 123 },
    });
  });

  it('runs migrations and records the metadata version', async () => {
    const { fake, storage } = createFixture();
    await fake.storage.local.set({ settings: { theme: 'dark' } });

    const item = storage.defineItem<Record<string, unknown>>('settings', {
      version: 2,
      fallback: {},
      migrations: {
        2(value) {
          return { ...(value as Record<string, unknown>), migrated: true };
        },
      },
    });

    await expect(item.getValue()).resolves.toEqual({
      theme: 'dark',
      migrated: true,
    });
    await expect(item.getMeta()).resolves.toEqual({ version: 2 });
    await expect(fake.storage.local.get('settings')).resolves.toEqual({
      settings: { theme: 'dark', migrated: true },
    });
  });

  it('watches storage changes for the item key and area', async () => {
    const { storage } = createFixture();
    const item = storage.defineItem<number>('watched', {
      area: 'sync',
      fallback: 0,
    });
    const changes: Array<[number, number | undefined]> = [];
    const stop = item.watch((newValue, oldValue) => {
      changes.push([newValue, oldValue]);
    });

    await storage.local.set({ watched: 1 });
    await Promise.resolve();
    expect(changes).toEqual([]);

    await storage.sync.set({ watched: 2 });
    await Promise.resolve();
    await Promise.resolve();
    expect(changes).toEqual([[2, undefined]]);

    stop();
    await storage.sync.set({ watched: 3 });
    await Promise.resolve();
    expect(changes).toEqual([[2, undefined]]);
  });

  it('throws a typed error when no fallback or init exists', async () => {
    const { storage } = createFixture();
    const item = storage.defineItem('missing');

    try {
      await item.getValue();
      throw new Error('expected rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(BrowserApiError);
      expect((error as BrowserApiError).code).toBe('BROWSER_API_FAILED');
    }
  });
});

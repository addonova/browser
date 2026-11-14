import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createStorageApi } from '../../src/api/storage/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import { createEvent } from '../helpers/fakes.ts';

type StorageCallback = (value: Record<string, unknown>) => void;

function createAreaFixture() {
  const data = new Map<string, unknown>();

  const resolveCallback = (
    args: unknown[],
  ): StorageCallback | undefined => {
    const candidate = [...args].reverse().find(
      (arg) => typeof arg === 'function',
    );

    return candidate as StorageCallback | undefined;
  };

  const get = (...args: unknown[]): void => {
    const callback = resolveCallback(args);
    const keys = args[0];

    if (callback === undefined) {
      return;
    }

    if (typeof keys === 'function' || keys == null) {
      callback(Object.fromEntries(data));
      return;
    }

    const names = typeof keys === 'string' ? [keys] : (keys as string[]);
    const result: Record<string, unknown> = {};

    for (const name of names) {
      if (data.has(name)) {
        result[name] = data.get(name);
      }
    }

    callback(result);
  };

  const set = (items: Record<string, unknown>, callback: () => void) => {
    for (const [key, value] of Object.entries(items)) {
      data.set(key, value);
    }
    callback();
  };

  const remove = (keys: string | string[], callback: () => void) => {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      data.delete(key);
    }
    callback();
  };

  const clear = (callback: () => void) => {
    data.clear();
    callback();
  };

  const getBytesInUse = (
    keysOrCallback: unknown,
    callback?: (value: number) => void,
  ) => {
    const resolved =
      typeof keysOrCallback === 'function'
        ? (keysOrCallback as (value: number) => void)
        : callback;

    resolved?.(42);
  };

  return {
    data,
    area: { get, set, remove, clear, getBytesInUse },
  };
}

function createStorageFixture() {
  const local = createAreaFixture();
  const sync = createAreaFixture();
  const session = createAreaFixture();
  const onChanged = createEvent();
  const api = {
    storage: {
      local: local.area,
      sync: sync.area,
      session: session.area,
      onChanged,
    },
  };

  return {
    local,
    sync,
    session,
    onChanged,
    storage: createStorageApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    ),
  };
}

describe('storage module', () => {
  it('gets, sets, removes, and clears a storage area', async () => {
    const { local, storage } = createStorageFixture();

    await storage.local.set({ theme: 'dark', count: 1 });
    expect(local.data.get('theme')).toBe('dark');

    await expect(storage.local.get('theme')).resolves.toEqual({
      theme: 'dark',
    });
    await expect(storage.local.get(['theme', 'missing'])).resolves.toEqual({
      theme: 'dark',
    });
    await expect(storage.local.get()).resolves.toEqual({
      theme: 'dark',
      count: 1,
    });

    await storage.local.remove('theme');
    expect(local.data.has('theme')).toBe(false);

    await storage.local.clear();
    expect(local.data.size).toBe(0);
  });

  it('exposes independent sync and session areas', async () => {
    const { sync, session, storage } = createStorageFixture();

    await storage.sync.set({ enabled: true });
    await storage.session.set({ draft: 'text' });

    expect(sync.data.get('enabled')).toBe(true);
    expect(session.data.get('draft')).toBe('text');
  });

  it('reports area availability', () => {
    const { storage } = createStorageFixture();

    expect(storage.isAreaAvailable('local')).toBe(true);
    expect(storage.isAreaAvailable('managed')).toBe(false);
  });

  it('reads byte usage for an area', async () => {
    const { storage } = createStorageFixture();

    await expect(storage.getBytesInUse('local')).resolves.toBe(42);
    await expect(
      storage.local.getBytesInUse(['theme']),
    ).resolves.toBe(42);
  });

  it('invokes area methods with the area as the receiver', async () => {
    const area = {
      data: new Map<string, unknown>(),
      set(
        this: { data: Map<string, unknown> },
        items: Record<string, unknown>,
        callback: () => void,
      ) {
        if (!(this.data instanceof Map)) {
          throw new TypeError('Illegal invocation');
        }

        for (const [key, value] of Object.entries(items)) {
          this.data.set(key, value);
        }

        callback();
      },
    };
    const api = {
      storage: {
        local: area,
        sync: createAreaFixture().area,
        session: createAreaFixture().area,
      },
    };
    const storage = createStorageApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    await storage.local.set({ theme: 'dark' });

    expect(area.data.get('theme')).toBe('dark');
  });

  it('passes storage change events through unchanged', () => {
    const { storage, onChanged } = createStorageFixture();

    expect(storage.onChanged).toBe(onChanged);

    let changes: unknown = null;
    storage.onChanged.addListener((value, areaName) => {
      changes = { value, areaName };
    });
    onChanged.emit({ theme: { newValue: 'dark' } }, 'local');
    expect(changes).toEqual({
      value: { theme: { newValue: 'dark' } },
      areaName: 'local',
    });
  });

  it('throws a typed error for unavailable areas', async () => {
    const { storage } = createStorageFixture();

    try {
      await storage.managed.get();
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe(
        'storage.managed.get',
      );
    }
  });
});

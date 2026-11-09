import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createTabsApi } from '../../src/api/tabs/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  createCallbackMethod,
  createEvent,
} from '../helpers/fakes.ts';

const tab = {
  id: 1,
  index: 0,
  windowId: 1,
  active: true,
  highlighted: true,
  pinned: false,
  incognito: false,
  url: 'https://example.com',
};

function createTabsFixture() {
  const calls: unknown[][] = [];
  const onCreated = createEvent();
  const onUpdated = createEvent();
  const onRemoved = createEvent();
  const onActivated = createEvent();
  const api = {
    tabs: {
      query: createCallbackMethod([tab], calls),
      get: createCallbackMethod(tab, calls),
      create: createCallbackMethod(tab, calls),
      update: createCallbackMethod(tab, calls),
      remove: createCallbackMethod(undefined, calls),
      reload: createCallbackMethod(undefined, calls),
      sendMessage: createCallbackMethod({ ok: true }, calls),
      onCreated,
      onUpdated,
      onRemoved,
      onActivated,
    },
  };

  return {
    calls,
    onCreated,
    onUpdated,
    onRemoved,
    onActivated,
    tabs: createTabsApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    ),
  };
}

describe('tabs module', () => {
  it('queries all or filtered tabs', async () => {
    const { tabs, calls } = createTabsFixture();

    await expect(tabs.query()).resolves.toEqual([tab]);
    expect(calls[0]).toEqual([]);

    const queryInfo = { active: true, currentWindow: true };
    await expect(tabs.query(queryInfo)).resolves.toEqual([tab]);
    expect(calls[1]).toEqual([queryInfo]);
  });

  it('gets, creates, updates, and removes tabs', async () => {
    const { tabs, calls } = createTabsFixture();

    await expect(tabs.get(7)).resolves.toEqual(tab);
    await expect(
      tabs.create({ url: 'https://example.com' }),
    ).resolves.toEqual(tab);
    await expect(
      tabs.update(7, { active: true }),
    ).resolves.toEqual(tab);
    await tabs.remove([7, 8]);

    expect(calls).toEqual([
      [7],
      [{ url: 'https://example.com' }],
      [7, { active: true }],
      [[7, 8]],
    ]);
  });

  it('reloads the active tab by default', async () => {
    const { tabs, calls } = createTabsFixture();

    await tabs.reload();
    await tabs.reload(3);
    await tabs.reload(3, { bypassCache: true });

    expect(calls).toEqual([
      [],
      [3],
      [3, { bypassCache: true }],
    ]);
  });

  it('sends messages to tabs', async () => {
    const { tabs, calls } = createTabsFixture();

    await expect(tabs.sendMessage(7, 'ping')).resolves.toEqual({
      ok: true,
    });
    expect(calls[0]).toEqual([7, 'ping']);
  });

  it('passes tab events through unchanged', () => {
    const {
      tabs,
      onCreated,
      onUpdated,
      onRemoved,
      onActivated,
    } = createTabsFixture();

    expect(tabs.onCreated).toBe(onCreated);
    expect(tabs.onUpdated).toBe(onUpdated);
    expect(tabs.onRemoved).toBe(onRemoved);
    expect(tabs.onActivated).toBe(onActivated);

    let created: unknown = null;
    tabs.onCreated.addListener((value) => {
      created = value;
    });
    onCreated.emit(tab);
    expect(created).toBe(tab);
  });

  it('throws a typed error for a missing method', async () => {
    const api = {
      tabs: {
        query: createCallbackMethod([tab]),
      },
    };
    const tabs = createTabsApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    try {
      await tabs.reload();
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe('tabs.reload');
    }
  });
});

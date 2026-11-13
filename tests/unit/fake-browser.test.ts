import { describe, expect, it } from '@guchho/test';

import {
  createFakeBrowser,
  fakeBrowser,
  installFakeBrowser,
  resetFakeBrowser,
  uninstallFakeBrowser,
} from '../../src/testing/fake-browser.ts';

describe('fake browser', () => {
  it('routes runtime messages through onMessage listeners', async () => {
    const fake = createFakeBrowser();
    fake.runtime.onMessage.addListener((message, sender, sendResponse) => {
      sendResponse({
        message,
        senderId: sender.id,
      });

      return true;
    });

    await expect(fake.runtime.sendMessage('ping')).resolves.toEqual({
      message: 'ping',
      senderId: 'fake-extension-id',
    });
  });

  it('provides in-memory storage with change events', async () => {
    const fake = createFakeBrowser();
    const changes: unknown[] = [];
    fake.storage.onChanged.addListener((value, areaName) => {
      changes.push({ value, areaName });
    });

    await fake.storage.local.set({ theme: 'dark' });
    await fake.storage.sync.set({ theme: 'light' });

    await expect(fake.storage.local.get('theme')).resolves.toEqual({
      theme: 'dark',
    });
    expect(changes).toEqual([
      {
        value: { theme: { newValue: 'dark' } },
        areaName: 'local',
      },
      {
        value: { theme: { newValue: 'light' } },
        areaName: 'sync',
      },
    ]);
  });

  it('manages tabs and emits tab events', async () => {
    const fake = createFakeBrowser();
    const created: number[] = [];
    const updates: number[] = [];
    fake.tabs.onCreated.addListener((tab) => {
      created.push(tab.id as number);
    });
    fake.tabs.onUpdated.addListener((tabId) => {
      updates.push(tabId);
    });

    const tab = await fake.tabs.create({
      url: 'https://example.com',
      active: true,
    });
    expect(tab.id).toBe(1);
    expect(created).toEqual([1]);

    await fake.tabs.update(1, { title: 'Updated' });
    expect(updates).toEqual([1]);
    await expect(fake.tabs.get(1)).resolves.toMatchObject({
      title: 'Updated',
    });
    await expect(
      fake.tabs.query({ active: true, currentWindow: true }),
    ).resolves.toHaveLength(1);

    await fake.tabs.remove(1);
    await expect(fake.tabs.query()).resolves.toEqual([]);
  });

  it('tracks permissions and i18n messages', async () => {
    const fake = createFakeBrowser({
      uiLanguage: 'de-DE',
      messages: {
        greeting: { message: 'Hallo $1' },
        plain: 'Text',
      },
      permissions: {
        permissions: ['storage'],
        origins: ['https://example.com/*'],
      },
    });

    await expect(
      fake.permissions.contains({
        permissions: ['storage'],
        origins: ['https://example.com/*'],
      }),
    ).resolves.toBe(true);
    await expect(
      fake.permissions.request({ permissions: ['tabs'] }),
    ).resolves.toBe(true);
    await expect(fake.permissions.getAll()).resolves.toEqual({
      permissions: ['storage', 'tabs'],
      origins: ['https://example.com/*'],
    });

    expect(fake.i18n.getMessage('greeting', 'Ada')).toBe('Hallo Ada');
    expect(fake.i18n.getMessage('plain')).toBe('Text');
    expect(fake.i18n.getMessage('missing')).toBe('');
    expect(fake.i18n.getUILanguage()).toBe('de-DE');
  });

  it('executes injected functions in the fake scripting API', async () => {
    const fake = createFakeBrowser();

    await expect(
      fake.scripting.executeScript({
        target: { tabId: 1, frameIds: [4] },
        func: (a: number, b: number) => a + b,
        args: [2, 3],
      }),
    ).resolves.toEqual([{ frameId: 4, result: 5 }]);
  });

  it('supports Firefox extension URLs', async () => {
    const fake = createFakeBrowser({ target: 'firefox' });

    expect(fake.runtime.getURL('/popup.html')).toBe(
      'moz-extension://fake-extension-id/popup.html',
    );
  });

  it('installs and resets the shared fake browser', async () => {
    const installed = installFakeBrowser();
    expect(installed).toBe(fakeBrowser);
    await installed.storage.local.set({ value: 1 });

    resetFakeBrowser();
    await expect(installed.storage.local.get()).resolves.toEqual({});

    uninstallFakeBrowser();
    expect(
      (globalThis as Record<string, unknown>).chrome,
    ).toBeUndefined();
  });
});

import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createAlarmsApi } from '../../src/api/alarms/index.ts';
import { createBookmarksApi } from '../../src/api/bookmarks/index.ts';
import { createCommandsApi } from '../../src/api/commands/index.ts';
import { createContextMenusApi } from '../../src/api/context-menus/index.ts';
import { createCookiesApi } from '../../src/api/cookies/index.ts';
import { createDownloadsApi } from '../../src/api/downloads/index.ts';
import { createI18nApi } from '../../src/api/i18n/index.ts';
import { createNotificationsApi } from '../../src/api/notifications/index.ts';
import { createScriptingApi } from '../../src/api/scripting/index.ts';
import { createSessionsApi } from '../../src/api/sessions/index.ts';
import { createWebNavigationApi } from '../../src/api/web-navigation/index.ts';
import { createWebRequestApi } from '../../src/api/web-request/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  createCallbackMethod,
  createEvent,
} from '../helpers/fakes.ts';

function adapterFor(api: unknown) {
  return createChromeAdapter({ api, manifestVersion: 3 });
}

describe('alarms module', () => {
  it('creates, reads, and clears alarms', async () => {
    const calls: unknown[][] = [];
    const alarm = { name: 'reminder', scheduledTime: 1000 };
    const onAlarm = createEvent();
    const api = {
      alarms: {
        create: (...args: unknown[]) => {
          calls.push(args);
        },
        get: createCallbackMethod(alarm, calls),
        getAll: createCallbackMethod([alarm], calls),
        clear: createCallbackMethod(true, calls),
        clearAll: createCallbackMethod(true, calls),
        onAlarm,
      },
    };
    const alarms = createAlarmsApi(adapterFor(api));

    await alarms.create('reminder', { delayInMinutes: 1 });
    await alarms.create({ periodInMinutes: 5 });
    await expect(alarms.get('reminder')).resolves.toEqual(alarm);
    await expect(alarms.getAll()).resolves.toEqual([alarm]);
    await expect(alarms.clear()).resolves.toBe(true);
    await expect(alarms.clearAll()).resolves.toBe(true);

    expect(calls).toEqual([
      ['reminder', { delayInMinutes: 1 }],
      [{ periodInMinutes: 5 }],
      ['reminder'],
      [],
      [],
      [],
    ]);
    expect(alarms.onAlarm).toBe(onAlarm);
  });
});

describe('commands module', () => {
  it('lists commands and passes events through', async () => {
    const command = { name: 'run', shortcut: 'Ctrl+Shift+Y' };
    const onCommand = createEvent();
    const api = {
      commands: {
        getAll: createCallbackMethod([command]),
        onCommand,
      },
    };
    const commands = createCommandsApi(adapterFor(api));

    await expect(commands.getAll()).resolves.toEqual([command]);
    expect(commands.onCommand).toBe(onCommand);
  });
});

describe('contextMenus module', () => {
  it('creates menus synchronously and updates them asynchronously', async () => {
    const calls: unknown[][] = [];
    const onClicked = createEvent();
    const api = {
      contextMenus: {
        create: (...args: unknown[]) => {
          calls.push(args);
          return 'menu-1';
        },
        update: createCallbackMethod(undefined, calls),
        remove: createCallbackMethod(undefined, calls),
        removeAll: createCallbackMethod(undefined, calls),
        onClicked,
      },
    };
    const menus = createContextMenusApi(adapterFor(api));

    expect(menus.create({ title: 'Open' })).toBe('menu-1');
    await menus.update('menu-1', { title: 'Updated' });
    await menus.remove('menu-1');
    await menus.removeAll();

    expect(calls).toEqual([
      [{ title: 'Open' }],
      ['menu-1', { title: 'Updated' }],
      ['menu-1'],
      [],
    ]);
    expect(menus.onClicked).toBe(onClicked);
  });
});

describe('notifications module', () => {
  it('creates, updates, clears, and lists notifications', async () => {
    const onClicked = createEvent();
    const onClosed = createEvent();
    const onButtonClicked = createEvent();
    const options = {
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Title',
      message: 'Message',
    };
    const api = {
      notifications: {
        create: createCallbackMethod('notification-1'),
        update: createCallbackMethod(true),
        clear: createCallbackMethod(true),
        getAll: createCallbackMethod({ 'notification-1': true }),
        onClicked,
        onClosed,
        onButtonClicked,
      },
    };
    const notifications = createNotificationsApi(adapterFor(api));

    await expect(notifications.create(options)).resolves.toBe(
      'notification-1',
    );
    await expect(
      notifications.update('notification-1', options),
    ).resolves.toBe(true);
    await expect(notifications.clear('notification-1')).resolves.toBe(
      true,
    );
    await expect(notifications.getAll()).resolves.toEqual({
      'notification-1': true,
    });
    expect(notifications.onClicked).toBe(onClicked);
    expect(notifications.onClosed).toBe(onClosed);
    expect(notifications.onButtonClicked).toBe(onButtonClicked);
  });
});

describe('bookmarks module', () => {
  it('supports bookmark CRUD and events', async () => {
    const node = { id: '1', title: 'Example', url: 'https://example.com' };
    const onCreated = createEvent();
    const onRemoved = createEvent();
    const onChanged = createEvent();
    const onMoved = createEvent();
    const api = {
      bookmarks: {
        getTree: createCallbackMethod([node]),
        search: createCallbackMethod([node]),
        get: createCallbackMethod([node]),
        create: createCallbackMethod(node),
        update: createCallbackMethod(node),
        remove: createCallbackMethod(undefined),
        removeTree: createCallbackMethod(undefined),
        onCreated,
        onRemoved,
        onChanged,
        onMoved,
      },
    };
    const bookmarks = createBookmarksApi(adapterFor(api));

    await expect(bookmarks.getTree()).resolves.toEqual([node]);
    await expect(bookmarks.search('example')).resolves.toEqual([node]);
    await expect(bookmarks.get('1')).resolves.toEqual([node]);
    await expect(
      bookmarks.create({ title: 'Example', url: 'https://example.com' }),
    ).resolves.toEqual(node);
    await expect(
      bookmarks.update('1', { title: 'Renamed' }),
    ).resolves.toEqual(node);
    await bookmarks.remove('1');
    await bookmarks.removeTree('1');

    expect(bookmarks.onCreated).toBe(onCreated);
    expect(bookmarks.onRemoved).toBe(onRemoved);
    expect(bookmarks.onChanged).toBe(onChanged);
    expect(bookmarks.onMoved).toBe(onMoved);
  });
});

describe('cookies module', () => {
  it('gets, lists, sets, and removes cookies', async () => {
    const cookie = {
      name: 'session',
      value: 'abc',
      domain: 'example.com',
      hostOnly: true,
      path: '/',
      secure: true,
      httpOnly: true,
      session: true,
      sameSite: 'lax',
    };
    const onChanged = createEvent();
    const api = {
      cookies: {
        get: createCallbackMethod(cookie),
        getAll: createCallbackMethod([cookie]),
        set: createCallbackMethod(cookie),
        remove: createCallbackMethod(cookie),
        onChanged,
      },
    };
    const cookies = createCookiesApi(adapterFor(api));

    await expect(
      cookies.get({ url: 'https://example.com', name: 'session' }),
    ).resolves.toEqual(cookie);
    await expect(
      cookies.getAll({ domain: 'example.com' }),
    ).resolves.toEqual([cookie]);
    await expect(
      cookies.set({
        url: 'https://example.com',
        name: 'session',
        value: 'abc',
      }),
    ).resolves.toEqual(cookie);
    await expect(
      cookies.remove({ url: 'https://example.com', name: 'session' }),
    ).resolves.toEqual(cookie);
    expect(cookies.onChanged).toBe(onChanged);
  });
});

describe('downloads module', () => {
  it('downloads, cancels, searches, and reports changes', async () => {
    const item = {
      id: 1,
      url: 'https://example.com/file.zip',
      filename: 'file.zip',
      state: 'complete',
    };
    const onChanged = createEvent();
    const api = {
      downloads: {
        download: createCallbackMethod(1),
        cancel: createCallbackMethod(undefined),
        search: createCallbackMethod([item]),
        onChanged,
      },
    };
    const downloads = createDownloadsApi(adapterFor(api));

    await expect(
      downloads.download({ url: 'https://example.com/file.zip' }),
    ).resolves.toBe(1);
    await downloads.cancel(1);
    await expect(downloads.search()).resolves.toEqual([item]);
    await expect(
      downloads.search({ state: 'complete' }),
    ).resolves.toEqual([item]);
    expect(downloads.onChanged).toBe(onChanged);
  });
});

describe('scripting module', () => {
  it('executes and injects CSS without emulation', async () => {
    const calls: unknown[][] = [];
    const api = {
      scripting: {
        executeScript: createCallbackMethod([{ frameId: 0, result: 42 }], calls),
        insertCSS: createCallbackMethod(undefined, calls),
        removeCSS: createCallbackMethod(undefined, calls),
      },
    };
    const scripting = createScriptingApi(adapterFor(api));
    const injection = { target: { tabId: 1 }, files: ['content.js'] };

    await expect(
      scripting.executeScript(injection),
    ).resolves.toEqual([{ frameId: 0, result: 42 }]);
    await scripting.insertCSS({ target: { tabId: 1 }, css: 'body{}' });
    await scripting.removeCSS({ target: { tabId: 1 }, css: 'body{}' });

    expect(calls).toEqual([
      [injection],
      [{ target: { tabId: 1 }, css: 'body{}' }],
      [{ target: { tabId: 1 }, css: 'body{}' }],
    ]);
  });

  it('throws for MV2 environments without scripting', async () => {
    const scripting = createScriptingApi(
      adapterFor({ tabs: { executeScript: createCallbackMethod([]) } }),
    );

    try {
      await scripting.executeScript({ target: { tabId: 1 } });
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe(
        'scripting.executeScript',
      );
    }
  });
});

describe('sessions module', () => {
  it('reads and restores sessions', async () => {
    const session = { lastModified: 1000, tab: { url: 'https://a.test' } };
    const onChanged = createEvent();
    const api = {
      sessions: {
        getRecentlyClosed: createCallbackMethod([session]),
        restore: createCallbackMethod(session),
        onChanged,
      },
    };
    const sessions = createSessionsApi(adapterFor(api));

    await expect(sessions.getRecentlyClosed()).resolves.toEqual([
      session,
    ]);
    await expect(
      sessions.getRecentlyClosed({ maxResults: 5 }),
    ).resolves.toEqual([session]);
    await expect(sessions.restore()).resolves.toEqual(session);
    await expect(sessions.restore('session-1')).resolves.toEqual(session);
    expect(sessions.onChanged).toBe(onChanged);
  });
});

describe('webNavigation module', () => {
  it('passes navigation events through unchanged', () => {
    const onBeforeNavigate = createEvent();
    const onCompleted = createEvent();
    const api = {
      webNavigation: {
        onBeforeNavigate,
        onCommitted: createEvent(),
        onDOMContentLoaded: createEvent(),
        onCompleted,
        onErrorOccurred: createEvent(),
        onCreatedNavigationTarget: createEvent(),
        onReferenceFragmentUpdated: createEvent(),
        onHistoryStateUpdated: createEvent(),
      },
    };
    const navigation = createWebNavigationApi(adapterFor(api));

    expect(navigation.onBeforeNavigate).toBe(onBeforeNavigate);
    expect(navigation.onCompleted).toBe(onCompleted);
  });

  it('throws for missing navigation events', () => {
    const navigation = createWebNavigationApi(adapterFor({}));

    expect(() => navigation.onCompleted).toThrow(/not available/);
  });
});

describe('webRequest module', () => {
  it('passes request events through unchanged', () => {
    const onBeforeRequest = createEvent();
    const onCompleted = createEvent();
    const api = {
      webRequest: {
        onBeforeRequest,
        onBeforeSendHeaders: createEvent(),
        onSendHeaders: createEvent(),
        onHeadersReceived: createEvent(),
        onResponseStarted: createEvent(),
        onCompleted,
        onErrorOccurred: createEvent(),
      },
    };
    const webRequest = createWebRequestApi(adapterFor(api));

    expect(webRequest.onBeforeRequest).toBe(onBeforeRequest);
    expect(webRequest.onCompleted).toBe(onCompleted);
  });
});

describe('i18n module', () => {
  it('reads messages and detects languages', async () => {
    const api = {
      i18n: {
        getMessage: (name: string, substitutions?: unknown) =>
          substitutions === undefined
            ? `message:${name}`
            : `message:${name}:${String(substitutions)}`,
        getUILanguage: () => 'en-US',
        detectLanguage: createCallbackMethod({
          isReliable: true,
          languages: [{ language: 'en', percentage: 100 }],
        }),
      },
    };
    const i18n = createI18nApi(adapterFor(api));

    expect(i18n.getMessage('greeting')).toBe('message:greeting');
    expect(i18n.getMessage('greeting', 'Ada')).toBe(
      'message:greeting:Ada',
    );
    expect(i18n.getUILanguage()).toBe('en-US');
    await expect(i18n.detectLanguage('hello')).resolves.toEqual({
      isReliable: true,
      languages: [{ language: 'en', percentage: 100 }],
    });
  });
});

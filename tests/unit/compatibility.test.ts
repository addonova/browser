import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createFirefoxAdapter } from '../../src/adapters/firefox/index.ts';
import { createActionApi } from '../../src/api/action/index.ts';
import { createNotificationsApi } from '../../src/api/notifications/index.ts';
import { createPermissionsApi } from '../../src/api/permissions/index.ts';
import { createRuntimeApi } from '../../src/api/runtime/index.ts';
import { createScriptingApi } from '../../src/api/scripting/index.ts';
import { createStorageApi } from '../../src/api/storage/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  createCallbackMethod,
  createEvent,
  createPromiseMethod,
} from '../helpers/fakes.ts';

async function captureError(
  run: () => Promise<unknown>,
): Promise<BrowserApiError | null> {
  try {
    await run();
    return null;
  } catch (error) {
    return error as BrowserApiError;
  }
}

function createActionSurface(calls: unknown[][] = []) {
  return {
    setBadgeText: createCallbackMethod(undefined, calls),
    setBadgeBackgroundColor: createCallbackMethod(undefined, calls),
    setTitle: createCallbackMethod(undefined, calls),
    setIcon: createCallbackMethod(undefined, calls),
    openPopup: createCallbackMethod(undefined, calls),
    onClicked: createEvent(),
  };
}

describe('compatibility matrix regression', () => {
  it('resolves the MV2 action surface and MV3 action surface', () => {
    const calls: unknown[][] = [];
    const mv2 = createActionApi(
      createChromeAdapter({
        api: {
          browserAction: createActionSurface(calls),
          action: createActionSurface(calls),
        },
        manifestVersion: 2,
      }),
    );
    const mv3 = createActionApi(
      createChromeAdapter({
        api: { action: createActionSurface(calls) },
        manifestVersion: 3,
      }),
    );

    expect(mv2.area).toBe('browserAction');
    expect(mv3.area).toBe('action');
  });

  it('does not emulate tabs.executeScript when scripting is absent', async () => {
    const calls: unknown[][] = [];
    const scripting = createScriptingApi(
      createChromeAdapter({
        api: {
          tabs: { executeScript: createCallbackMethod([], calls) },
        },
        manifestVersion: 2,
      }),
    );

    const error = await captureError(() =>
      scripting.executeScript({
        target: { tabId: 1 },
        files: ['content.js'],
      }),
    );

    expect(error?.code).toBe('BROWSER_UNSUPPORTED_API');
    expect(error?.api).toBe('scripting.executeScript');
    expect(calls).toEqual([]);
  });

  it('uses native Promise scripting in Firefox MV2', async () => {
    const calls: unknown[][] = [];
    const scriptingApi = {
      executeScript: createPromiseMethod(
        [{ frameId: 0, result: 'ok' }],
        calls,
      ),
      insertCSS: createPromiseMethod(undefined, calls),
      removeCSS: createPromiseMethod(undefined, calls),
    };
    const scripting = createScriptingApi(
      createFirefoxAdapter({
        api: { scripting: scriptingApi },
        manifestVersion: 2,
      }),
    );
    const injection = {
      target: { tabId: 7 },
      func: () => 'ok',
    };

    await expect(scripting.executeScript(injection)).resolves.toEqual([
      { frameId: 0, result: 'ok' },
    ]);
    expect(calls).toEqual([[injection]]);
  });

  it('passes runtime.onSuspend through on Firefox MV2', () => {
    const onSuspend = createEvent();
    const runtime = createRuntimeApi(
      createFirefoxAdapter({
        api: { runtime: { id: 'test-id', onSuspend } },
        manifestVersion: 2,
      }),
    );

    expect(runtime.onSuspend).toBe(onSuspend);
  });

  it('throws a typed error for missing runtime.onSuspend', () => {
    const runtime = createRuntimeApi(
      createChromeAdapter({
        api: { runtime: { id: 'test-id' } },
        manifestVersion: 3,
      }),
    );

    expect(() => runtime.onSuspend).toThrow(/not available/);
  });

  it('reports a missing storage.session area and rejects on access', async () => {
    const storage = createStorageApi(
      createChromeAdapter({
        api: { storage: {} },
        manifestVersion: 3,
      }),
    );

    expect(storage.isAreaAvailable('session')).toBe(false);

    const error = await captureError(() => storage.session.get());

    expect(error?.code).toBe('BROWSER_UNSUPPORTED_API');
    expect(error?.api).toBe('storage.session.get');
  });

  it('does not request permissions when the module is constructed', async () => {
    const calls: unknown[][] = [];
    const permissions = createPermissionsApi(
      createChromeAdapter({
        api: {
          permissions: {
            request: createCallbackMethod(true, calls),
          },
        },
        manifestVersion: 3,
      }),
    );

    expect(calls).toEqual([]);

    await expect(
      permissions.request({ permissions: ['tabs'] }),
    ).resolves.toBe(true);
    expect(calls).toEqual([[{ permissions: ['tabs'] }]]);
  });

  it('surfaces unsupported Firefox notification operations explicitly', async () => {
    const notifications = createNotificationsApi(
      createFirefoxAdapter({
        api: {
          notifications: {
            create: createPromiseMethod('notification-id'),
            clear: createPromiseMethod(true),
            getAll: createPromiseMethod({}),
            onClicked: createEvent(),
            onClosed: createEvent(),
          },
        },
        manifestVersion: 2,
      }),
    );

    const error = await captureError(() =>
      notifications.update('notification-id', {
        iconUrl: 'icons/icon.png',
        title: 'Title',
        message: 'Message',
      }),
    );

    expect(error?.code).toBe('BROWSER_UNSUPPORTED_API');
    expect(error?.api).toBe('notifications.update');
    expect(() => notifications.onButtonClicked).toThrow(/not available/);
  });
});

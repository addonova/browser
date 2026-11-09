import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createFirefoxAdapter } from '../../src/adapters/firefox/index.ts';
import { createRuntimeApi } from '../../src/api/runtime/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import { createEvent } from '../helpers/fakes.ts';

const manifest = {
  manifest_version: 3,
  name: 'Test extension',
  version: '1.0.0',
};

function createChromiumFixture() {
  const onMessage = createEvent();
  const onInstalled = createEvent();
  const onStartup = createEvent();
  const onSuspend = createEvent();
  const port = {
    name: 'port',
    postMessage() {},
    disconnect() {},
    onMessage,
    onDisconnect: createEvent(),
  };
  const runtimeApi = {
    id: 'test-id',
    lastError: undefined as { message?: string } | undefined,
    getManifest: () => manifest,
    getURL: (path: string) => `chrome-extension://test-id/${path}`,
    sendMessage: (
      message: unknown,
      callback: (response: unknown) => void,
    ) => {
      callback({ echo: message });
    },
    connect: (info?: { name?: string }) => ({
      ...port,
      name: info?.name ?? port.name,
    }),
    onMessage,
    onInstalled,
    onStartup,
    onSuspend,
  };
  const api = { runtime: runtimeApi };

  return {
    api,
    runtimeApi,
    onMessage,
    onInstalled,
    onStartup,
    onSuspend,
    runtime: createRuntimeApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    ),
  };
}

describe('runtime module', () => {
  it('exposes runtime metadata synchronously', () => {
    const { runtime } = createChromiumFixture();

    expect(runtime.id).toBe('test-id');
    expect(runtime.getManifest()).toBe(manifest);
    expect(runtime.getURL('icons/icon.png')).toBe(
      'chrome-extension://test-id/icons/icon.png',
    );
  });

  it('wraps callback-based messaging in a Promise', async () => {
    const { runtime } = createChromiumFixture();

    await expect(runtime.sendMessage({ hello: 'world' })).resolves.toEqual({
      echo: { hello: 'world' },
    });
  });

  it('preserves native Promise messaging for Firefox', async () => {
    const api = {
      runtime: {
        id: 'test-id',
        getManifest: () => manifest,
        getURL: (path: string) => `moz-extension://test-id/${path}`,
        sendMessage: (message: unknown) =>
          Promise.resolve({ echo: message }),
        connect: () => ({
          name: 'port',
          postMessage() {},
          disconnect() {},
          onMessage: createEvent(),
          onDisconnect: createEvent(),
        }),
        onMessage: createEvent(),
        onInstalled: createEvent(),
        onStartup: createEvent(),
        onSuspend: createEvent(),
      },
    };
    const runtime = createRuntimeApi(
      createFirefoxAdapter({ api, manifestVersion: 2 }),
    );

    await expect(runtime.sendMessage('ping')).resolves.toEqual({
      echo: 'ping',
    });
    expect(runtime.getURL('a.html')).toBe('moz-extension://test-id/a.html');
  });

  it('returns connection ports', () => {
    const { runtime } = createChromiumFixture();

    expect(runtime.connect({ name: 'background' }).name).toBe(
      'background',
    );
  });

  it('passes events through unchanged', () => {
    const { runtime, onMessage, onInstalled, onStartup, onSuspend } =
      createChromiumFixture();

    expect(runtime.onMessage).toBe(onMessage);
    expect(runtime.onInstalled).toBe(onInstalled);
    expect(runtime.onStartup).toBe(onStartup);
    expect(runtime.onSuspend).toBe(onSuspend);

    let received: unknown = null;
    runtime.onMessage.addListener((message) => {
      received = message;
      return false;
    });
    onMessage.emit('hello', {}, () => {});
    expect(received).toBe('hello');
    expect(onMessage.listenerCount).toBe(1);
  });

  it('normalizes lastError failures', async () => {
    const { runtime, runtimeApi } = createChromiumFixture();
    runtimeApi.lastError = { message: 'Permission denied' };

    try {
      await runtime.sendMessage('test');
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_PERMISSION_DENIED',
      );
      expect((error as BrowserApiError).api).toBe('runtime.sendMessage');
    }
  });

  it('throws a typed error for missing runtime events', () => {
    const api = { runtime: { id: 'test-id' } };
    const runtime = createRuntimeApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    expect(() => runtime.onStartup).toThrow(/not available/);
  });
});

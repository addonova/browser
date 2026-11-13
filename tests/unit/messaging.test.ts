import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from '@guchho/test';

import {
  defineExtensionMessaging,
} from '../../src/messaging/root.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  installFakeBrowser,
  resetFakeBrowser,
  uninstallFakeBrowser,
} from '../../src/testing/fake-browser.ts';

interface Protocol {
  add(data: { a: number; b: number }): number;
  greet(name: string): string;
  ping(): string;
  fail(): void;
  asyncValue(): Promise<string>;
}

const { sendMessage, onMessage } = defineExtensionMessaging<Protocol>();

beforeEach(() => {
  installFakeBrowser();
  resetFakeBrowser();
});

afterEach(() => {
  uninstallFakeBrowser();
});

describe('extension messaging', () => {
  it('routes typed requests and responses', async () => {
    const stop = onMessage('add', ({ data }) => data.a + data.b);

    await expect(sendMessage('add', { a: 2, b: 3 })).resolves.toBe(5);
    stop();
  });

  it('supports messages without data and async handlers', async () => {
    const stopPing = onMessage('ping', () => 'pong');
    const stopAsync = onMessage('asyncValue', async () => 'later');

    await expect(sendMessage('ping')).resolves.toBe('pong');
    await expect(sendMessage('asyncValue')).resolves.toBe('later');

    stopPing();
    stopAsync();
  });

  it('sends a single data argument', async () => {
    const stop = onMessage('greet', ({ data }) => `Hello ${data}`);

    await expect(sendMessage('greet', 'Ada')).resolves.toBe('Hello Ada');
    stop();
  });

  it('passes the sender through to handlers', async () => {
    const stop = onMessage('ping', ({ sender }) => sender.id ?? 'missing');

    await expect(sendMessage('ping')).resolves.toBe('fake-extension-id');
    stop();
  });

  it('serializes handler errors', async () => {
    const stop = onMessage('fail', () => {
      throw new BrowserApiError(
        'BROWSER_PERMISSION_DENIED',
        'Permission denied.',
      );
    });

    try {
      await sendMessage('fail');
      throw new Error('expected rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(BrowserApiError);
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_PERMISSION_DENIED',
      );
      expect((error as BrowserApiError).message).toBe('Permission denied.');
    }

    stop();
  });

  it('stops listening after the unsubscribe function runs', async () => {
    const stop = onMessage('ping', () => 'pong');
    stop();

    await expect(sendMessage('ping')).resolves.toBeUndefined();
  });
});

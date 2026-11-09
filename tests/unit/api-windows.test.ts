import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createWindowsApi } from '../../src/api/windows/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import { createCallbackMethod } from '../helpers/fakes.ts';

const window = {
  id: 1,
  focused: true,
  type: 'normal',
  state: 'normal',
};

function createWindowsFixture() {
  const calls: unknown[][] = [];
  const api = {
    windows: {
      getCurrent: createCallbackMethod(window, calls),
      create: createCallbackMethod(window, calls),
      update: createCallbackMethod(window, calls),
      remove: createCallbackMethod(undefined, calls),
      getAll: createCallbackMethod([window], calls),
    },
  };

  return {
    calls,
    windows: createWindowsApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    ),
  };
}

describe('windows module', () => {
  it('reads the current window', async () => {
    const { windows, calls } = createWindowsFixture();

    await expect(windows.getCurrent()).resolves.toEqual(window);
    await expect(
      windows.getCurrent({ populate: true }),
    ).resolves.toEqual(window);

    expect(calls).toEqual([[], [{ populate: true }]]);
  });

  it('creates, updates, and removes windows', async () => {
    const { windows, calls } = createWindowsFixture();

    await expect(
      windows.create({ url: 'popup.html', type: 'popup' }),
    ).resolves.toEqual(window);
    await expect(
      windows.update(1, { focused: true }),
    ).resolves.toEqual(window);
    await windows.remove(1);

    expect(calls).toEqual([
      [{ url: 'popup.html', type: 'popup' }],
      [1, { focused: true }],
      [1],
    ]);
  });

  it('lists all windows', async () => {
    const { windows } = createWindowsFixture();

    await expect(windows.getAll()).resolves.toEqual([window]);
  });

  it('throws a typed error for a missing method', async () => {
    const api = { windows: { getCurrent: createCallbackMethod(window) } };
    const windows = createWindowsApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    try {
      await windows.remove(1);
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe('windows.remove');
    }
  });
});

import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createActionApi } from '../../src/api/action/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  createCallbackMethod,
  createEvent,
} from '../helpers/fakes.ts';

function createAreaFixture(calls: unknown[][]) {
  return {
    setBadgeText: createCallbackMethod(undefined, calls),
    setBadgeBackgroundColor: createCallbackMethod(undefined, calls),
    setTitle: createCallbackMethod(undefined, calls),
    setIcon: createCallbackMethod(undefined, calls),
    openPopup: createCallbackMethod(undefined, calls),
    onClicked: createEvent(),
  };
}

describe('action module', () => {
  it('uses the MV3 action namespace', async () => {
    const calls: unknown[][] = [];
    const actionArea = createAreaFixture(calls);
    const api = { action: actionArea };
    const action = createActionApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    expect(action.area).toBe('action');

    await action.setBadgeText({ text: 'ON' });
    await action.setBadgeBackgroundColor({ color: '#2563eb' });
    await action.setTitle({ title: 'My Extension' });
    await action.setIcon({ path: 'icons/icon.png' });
    await action.openPopup();

    expect(calls).toEqual([
      [{ text: 'ON' }],
      [{ color: '#2563eb' }],
      [{ title: 'My Extension' }],
      [{ path: 'icons/icon.png' }],
      [],
    ]);
  });

  it('prefers browserAction for MV2', () => {
    const calls: unknown[][] = [];
    const api = {
      action: createAreaFixture(calls),
      browserAction: createAreaFixture(calls),
    };
    const action = createActionApi(
      createChromeAdapter({ api, manifestVersion: 2 }),
    );

    expect(action.area).toBe('browserAction');
  });

  it('falls back to pageAction when it is the only surface', () => {
    const calls: unknown[][] = [];
    const api = {
      pageAction: createAreaFixture(calls),
    };
    const action = createActionApi(
      createChromeAdapter({ api, manifestVersion: 2 }),
    );

    expect(action.area).toBe('pageAction');
  });

  it('reports a null area when no action surface exists', async () => {
    const api = { runtime: { id: 'test-id' } };
    const action = createActionApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    expect(action.area).toBeNull();

    try {
      await action.setBadgeText({ text: 'ON' });
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe('action');
    }
  });

  it('does not emulate openPopup when unavailable', async () => {
    const calls: unknown[][] = [];
    const actionArea: Record<string, unknown> = {
      ...createAreaFixture(calls),
    };
    delete actionArea.openPopup;
    const api = { action: actionArea };
    const action = createActionApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    try {
      await action.openPopup();
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe('action.openPopup');
    }
  });

  it('passes action click events through unchanged', () => {
    const calls: unknown[][] = [];
    const actionArea = createAreaFixture(calls);
    const api = { action: actionArea };
    const action = createActionApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    expect(action.onClicked).toBe(actionArea.onClicked);
  });
});

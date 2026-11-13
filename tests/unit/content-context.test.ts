import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from '@guchho/test';

import { createContentScriptContext } from '../../src/content/index.ts';
import { injectScript } from '../../src/content/inject-root.ts';
import {
  installFakeBrowser,
  uninstallFakeBrowser,
} from '../../src/testing/fake-browser.ts';

beforeEach(() => {
  installFakeBrowser();
});

afterEach(() => {
  uninstallFakeBrowser();
});

describe('content script context', () => {
  it('tracks validity and invalidates timers', async () => {
    const context = createContentScriptContext();
    let first = false;
    let second = false;
    const invalidated: string[] = [];

    context.setTimeout(() => {
      first = true;
    }, 0);
    context.setTimeout(() => {
      second = true;
    }, 50);
    context.onInvalidated(() => invalidated.push('first'));

    await delay(10);
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(context.isValid).toBe(true);

    context.invalidate();
    await delay(60);

    expect(second).toBe(false);
    expect(context.isValid).toBe(false);
    expect(invalidated).toEqual(['first']);
  });

  it('removes listeners when invalidated', () => {
    const context = createContentScriptContext();
    const target = new EventTarget();
    let calls = 0;

    context.addEventListener(target, 'test', () => {
      calls += 1;
    });
    target.dispatchEvent(new Event('test'));
    expect(calls).toBe(1);

    context.invalidate();
    target.dispatchEvent(new Event('test'));
    expect(calls).toBe(1);
  });

  it('returns a no-op cleanup for already invalidated contexts', () => {
    const context = createContentScriptContext();
    context.invalidate();
    let calls = 0;
    const stop = context.onInvalidated(() => {
      calls += 1;
    });

    expect(calls).toBe(1);
    stop();
  });

  it('injects scripts into an explicit tab and frame', async () => {
    const results = await injectScript('inject.js', {
      tabId: 1,
      frameIds: [2],
      world: 'MAIN',
    });

    expect(results).toEqual([{ frameId: 2 }]);
  });

  it('resolves the active tab when no tab is provided', async () => {
    const fake = installFakeBrowser();
    await fake.tabs.create({
      url: 'https://example.com',
      active: true,
    });

    const results = await injectScript(['one.js', 'two.js']);

    expect(results).toEqual([{ frameId: 0 }]);
  });
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

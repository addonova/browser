import { describe, expect, it } from '@guchho/test';

import {
  clearAdapterCache,
  resolveAdapter,
} from '../../src/browser/resolve.ts';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const chromeScope = { chrome: { runtime: { id: 'ext-id' } } };
const firefoxScope = { browser: { runtime: { id: 'ext-id' } } };

describe('resolveAdapter', () => {
  it('resolves a Chrome adapter from the environment', () => {
    const adapter = resolveAdapter({ scope: chromeScope, userAgent: CHROME_UA });

    expect(adapter).not.toBeNull();
    expect(adapter?.target).toBe('chrome');
    expect(adapter?.engine).toBe('chromium');
  });

  it('resolves a Firefox adapter from the environment', () => {
    const adapter = resolveAdapter({ scope: firefoxScope });

    expect(adapter?.target).toBe('firefox');
    expect(adapter?.engine).toBe('gecko');
    expect(adapter?.callbackBased).toBe(false);
  });

  it('honors a build-time target override while using the real API', () => {
    const adapter = resolveAdapter({ scope: chromeScope, target: 'edge' });

    expect(adapter?.target).toBe('edge');
    expect(adapter?.engine).toBe('chromium');
    expect(adapter?.namespace('runtime')).toBe(chromeScope.chrome.runtime);
  });

  it('does not invent an adapter without an extension runtime', () => {
    expect(resolveAdapter({ scope: {} })).toBeNull();
    expect(resolveAdapter({ scope: {}, target: 'chrome' })).toBeNull();
  });

  it('can clear the memoized adapter', () => {
    clearAdapterCache();
    expect(resolveAdapter({ scope: {} })).toBeNull();
  });
});

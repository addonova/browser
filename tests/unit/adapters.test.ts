import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createChromiumAdapter } from '../../src/adapters/chromium/index.ts';
import { createEdgeAdapter } from '../../src/adapters/edge/index.ts';
import { createFirefoxAdapter } from '../../src/adapters/firefox/index.ts';
import { unavailableCapability } from '../../src/shared/capabilities.ts';

const api = {
  runtime: { id: 'ext-id' },
  tabs: { query() {} },
};

describe('chromium adapters', () => {
  it('reuses the shared Chromium implementation for Chrome and Edge', () => {
    const chrome = createChromeAdapter({ api, manifestVersion: 3 });
    const edge = createEdgeAdapter({ api, manifestVersion: 3 });

    expect(chrome.target).toBe('chrome');
    expect(edge.target).toBe('edge');
    expect(chrome.engine).toBe('chromium');
    expect(edge.engine).toBe('chromium');
    expect(chrome.callbackBased).toBe(true);
    expect(edge.callbackBased).toBe(true);
    expect(chrome.supports({ namespace: 'tabs', method: 'query' })).toBe(true);
    expect(edge.supports({ namespace: 'tabs', method: 'query' })).toBe(true);
  });

  it('supports a Chromium target directly', () => {
    const chromium = createChromiumAdapter({
      target: 'chromium',
      api,
      manifestVersion: 3,
    });

    expect(chromium.target).toBe('chromium');
    expect(chromium.engine).toBe('chromium');
  });

  it('applies browser-specific capability overrides', () => {
    const edge = createEdgeAdapter({
      api,
      manifestVersion: 3,
      overrides: (query, availability) =>
        query.namespace === 'tabs'
          ? unavailableCapability(query, 'unsupported-browser')
          : availability,
    });

    expect(edge.supports({ namespace: 'tabs' })).toBe(false);
    expect(edge.supports({ namespace: 'runtime' })).toBe(true);
  });
});

describe('firefox adapter', () => {
  it('uses the native Promise API and gecko engine', () => {
    const firefox = createFirefoxAdapter({ api, manifestVersion: 2 });

    expect(firefox.target).toBe('firefox');
    expect(firefox.engine).toBe('gecko');
    expect(firefox.callbackBased).toBe(false);
    expect(firefox.manifestVersion).toBe(2);
    expect(firefox.namespace('runtime')).toBe(api.runtime);
    expect(firefox.supports({ namespace: 'tabs', method: 'query' })).toBe(true);
  });
});

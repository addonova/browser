import { describe, expect, it } from '@guchho/test';

import {
  getAvailability,
  isBrowserSupported,
  normalizeQuery,
  supports,
} from '../../src/browser/support.ts';

const scope = {
  chrome: {
    runtime: { id: 'ext-id' },
    tabs: { query() {} },
    storage: { local: {} },
  },
};

describe('supports', () => {
  it('detects namespaces and methods', () => {
    expect(supports('tabs', { scope })).toBe(true);
    expect(supports('tabs.query', { scope })).toBe(true);
    expect(supports('storage.local', { scope })).toBe(true);
    expect(supports('tabs.missing', { scope })).toBe(false);
    expect(supports('bookmarks', { scope })).toBe(false);
  });

  it('returns false outside an extension', () => {
    expect(supports('tabs', { scope: {} })).toBe(false);
  });
});

describe('isBrowserSupported', () => {
  it('requires an extension runtime', () => {
    expect(isBrowserSupported({ scope })).toBe(true);
    expect(isBrowserSupported({ scope: {} })).toBe(false);
  });
});

describe('getAvailability', () => {
  it('reports available capabilities', () => {
    expect(getAvailability('tabs.query', { scope })).toEqual({
      namespace: 'tabs',
      method: 'query',
      available: true,
    });
  });

  it('reports missing APIs with a reason', () => {
    expect(getAvailability('bookmarks', { scope })).toEqual({
      namespace: 'bookmarks',
      available: false,
      reason: 'missing-api',
    });
  });

  it('reports an unsupported environment', () => {
    expect(getAvailability('tabs', { scope: {} })).toEqual({
      namespace: 'tabs',
      available: false,
      reason: 'unsupported-browser',
    });
  });
});

describe('normalizeQuery', () => {
  it('splits dotted strings into namespace and method', () => {
    expect(normalizeQuery('tabs.query')).toEqual({
      namespace: 'tabs',
      method: 'query',
    });
    expect(normalizeQuery('tabs')).toEqual({ namespace: 'tabs' });
    expect(normalizeQuery({ namespace: 'tabs', method: 'get' })).toEqual({
      namespace: 'tabs',
      method: 'get',
    });
  });
});

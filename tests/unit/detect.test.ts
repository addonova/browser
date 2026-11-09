import { describe, expect, it } from '@guchho/test';

import {
  detectBrowser,
  detectBrowserVersion,
  readUserAgent,
} from '../../src/browser/detect.ts';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
const CHROMIUM_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/120.0.0.0 Safari/537.36';
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';

const chromeScope = { chrome: { runtime: { id: 'ext-id' } } };
const firefoxScope = { browser: { runtime: { id: 'ext-id' } } };

describe('detectBrowser', () => {
  it('reports an unknown environment without extension globals', () => {
    const result = detectBrowser({ scope: {} });

    expect(result.name).toBe('unknown');
    expect(result.engine).toBe('unknown');
    expect(result.api).toBeNull();
    expect(result.source).toBe('none');
  });

  it('detects Chrome from the chrome global', () => {
    const result = detectBrowser({ scope: chromeScope, userAgent: CHROME_UA });

    expect(result.name).toBe('chrome');
    expect(result.engine).toBe('chromium');
    expect(result.version).toBe('120.0.0.0');
    expect(result.source).toBe('chrome');
    expect(result.callbackBased).toBe(true);
  });

  it('detects Edge from the user agent', () => {
    const result = detectBrowser({ scope: chromeScope, userAgent: EDGE_UA });

    expect(result.name).toBe('edge');
    expect(result.engine).toBe('chromium');
    expect(result.version).toBe('120.0.0.0');
  });

  it('detects Chromium from the user agent', () => {
    const result = detectBrowser({
      scope: chromeScope,
      userAgent: CHROMIUM_UA,
    });

    expect(result.name).toBe('chromium');
    expect(result.engine).toBe('chromium');
  });

  it('defaults to Chromium when the user agent is unavailable', () => {
    const result = detectBrowser({ scope: chromeScope, userAgent: null });

    expect(result.name).toBe('chromium');
    expect(result.version).toBe('');
  });

  it('detects Firefox from the browser global', () => {
    const result = detectBrowser({ scope: firefoxScope, userAgent: FIREFOX_UA });

    expect(result.name).toBe('firefox');
    expect(result.engine).toBe('gecko');
    expect(result.version).toBe('121.0');
    expect(result.source).toBe('browser');
    expect(result.callbackBased).toBe(false);
  });

  it('prefers the browser global when both globals exist', () => {
    const result = detectBrowser({
      scope: { ...chromeScope, ...firefoxScope },
      userAgent: CHROME_UA,
    });

    expect(result.source).toBe('browser');
    expect(result.callbackBased).toBe(false);
    expect(result.engine).toBe('chromium');
    expect(result.name).toBe('chrome');
  });

  it('skips name detection when resolveName is false', () => {
    const result = detectBrowser({
      scope: chromeScope,
      userAgent: CHROME_UA,
      resolveName: false,
    });

    expect(result.name).toBe('unknown');
    expect(result.engine).toBe('unknown');
    expect(result.api).toBe(chromeScope.chrome);
  });
});

describe('detectBrowserVersion', () => {
  it('parses supported browser versions', () => {
    expect(detectBrowserVersion('chrome', CHROME_UA)).toBe('120.0.0.0');
    expect(detectBrowserVersion('edge', EDGE_UA)).toBe('120.0.0.0');
    expect(detectBrowserVersion('chromium', CHROMIUM_UA)).toBe('120.0.0.0');
    expect(detectBrowserVersion('firefox', FIREFOX_UA)).toBe('121.0');
  });

  it('returns an empty version when it cannot be parsed', () => {
    expect(detectBrowserVersion('chrome', null)).toBe('');
    expect(detectBrowserVersion('unknown', CHROME_UA)).toBe('');
    expect(detectBrowserVersion('chrome', 'not a browser')).toBe('');
  });
});

describe('readUserAgent', () => {
  it('reads the navigator user agent safely', () => {
    expect(readUserAgent({ navigator: { userAgent: 'agent' } })).toBe('agent');
    expect(readUserAgent({})).toBeNull();
    expect(readUserAgent({ navigator: {} })).toBeNull();
  });
});

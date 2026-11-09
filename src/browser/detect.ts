import { readProperty } from '../shared/objects.ts';
import type { BrowserEngine, BrowserTarget } from '../shared/capabilities.ts';

export interface DetectBrowserOptions {
  scope?: unknown;
  userAgent?: string | null;
  resolveName?: boolean;
}

export type DetectionSource = 'browser' | 'chrome' | 'none';

export interface DetectionResult {
  readonly name: BrowserTarget | 'unknown';
  readonly engine: BrowserEngine;
  readonly version: string;
  readonly api: unknown | null;
  readonly source: DetectionSource;
  readonly callbackBased: boolean;
}

const VERSION_PATTERNS: Readonly<Record<BrowserTarget, RegExp>> = {
  chrome: /(?:Chrome|CriOS)\/([\d.]+)/,
  chromium: /Chromium\/([\d.]+)/,
  edge: /Edg(?:e|A|iOS)?\/([\d.]+)/,
  firefox: /(?:Firefox|FxiOS)\/([\d.]+)/,
};

export function detectBrowser(
  options: DetectBrowserOptions = {},
): DetectionResult {
  const scope = options.scope ?? globalThis;
  const browserApi = readProperty(scope, 'browser');
  const chromeApi = readProperty(scope, 'chrome');
  const browserValid = hasRuntimeId(browserApi);
  const chromeValid = hasRuntimeId(chromeApi);

  if (!browserValid && !chromeValid) {
    return {
      name: 'unknown',
      engine: 'unknown',
      version: '',
      api: null,
      source: 'none',
      callbackBased: false,
    };
  }

  const api = browserValid ? browserApi : chromeApi;
  const source: DetectionSource = browserValid ? 'browser' : 'chrome';
  const callbackBased = !browserValid;

  if (options.resolveName === false) {
    return {
      name: 'unknown',
      engine: 'unknown',
      version: '',
      api,
      source,
      callbackBased,
    };
  }

  const userAgent =
    options.userAgent === undefined ? readUserAgent(scope) : options.userAgent;

  if (chromeValid) {
    const name = detectChromiumName(userAgent);

    return {
      name,
      engine: 'chromium',
      version: detectBrowserVersion(name, userAgent),
      api,
      source,
      callbackBased,
    };
  }

  return {
    name: 'firefox',
    engine: 'gecko',
    version: detectBrowserVersion('firefox', userAgent),
    api,
    source,
    callbackBased,
  };
}

export function readUserAgent(scope: unknown = globalThis): string | null {
  const navigator = readProperty(scope, 'navigator');
  const userAgent = readProperty(navigator, 'userAgent');

  return typeof userAgent === 'string' && userAgent !== '' ? userAgent : null;
}

export function detectBrowserVersion(
  name: BrowserTarget | 'unknown',
  userAgent: string | null,
): string {
  if (name === 'unknown' || userAgent === null) {
    return '';
  }

  const match = VERSION_PATTERNS[name].exec(userAgent);
  return match?.[1] ?? '';
}

function detectChromiumName(userAgent: string | null): BrowserTarget {
  if (userAgent !== null) {
    if (/Edg(?:e|A|iOS)?\//.test(userAgent)) {
      return 'edge';
    }

    if (/Chromium\//.test(userAgent)) {
      return 'chromium';
    }

    if (/(?:Chrome|CriOS)\//.test(userAgent)) {
      return 'chrome';
    }
  }

  return 'chromium';
}

function hasRuntimeId(api: unknown): boolean {
  const runtime = readProperty(api, 'runtime');
  const id = readProperty(runtime, 'id');

  return typeof id === 'string' && id !== '';
}

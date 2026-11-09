import { getCompileTarget } from '../build/target.ts';
import type { CompileTarget } from '../build/target.ts';
import { createChromeAdapter } from '../adapters/chrome/index.ts';
import { createChromiumAdapter } from '../adapters/chromium/index.ts';
import { createEdgeAdapter } from '../adapters/edge/index.ts';
import { createFirefoxAdapter } from '../adapters/firefox/index.ts';
import type { BrowserAdapter } from '../adapters/types.ts';
import { detectBrowser } from './detect.ts';
import type { DetectBrowserOptions } from './detect.ts';
import { readManifestVersion } from './info.ts';

export interface ResolveAdapterOptions extends DetectBrowserOptions {
  target?: CompileTarget;
}

let cachedAdapter: BrowserAdapter | null | undefined;

export function resolveAdapter(
  options: ResolveAdapterOptions = {},
): BrowserAdapter | null {
  const useCache =
    options.scope === undefined &&
    options.userAgent === undefined &&
    options.target === undefined;

  if (useCache && cachedAdapter !== undefined) {
    return cachedAdapter;
  }

  const adapter = createResolvedAdapter(options);

  if (useCache) {
    cachedAdapter = adapter;
  }

  return adapter;
}

export function clearAdapterCache(): void {
  cachedAdapter = undefined;
}

function createResolvedAdapter(
  options: ResolveAdapterOptions,
): BrowserAdapter | null {
  const target = options.target ?? getCompileTarget();
  const detection = detectBrowser({
    ...(options.scope === undefined ? {} : { scope: options.scope }),
    ...(options.userAgent === undefined ? {} : { userAgent: options.userAgent }),
    resolveName: target === 'auto',
  });
  const name = target === 'auto' ? detection.name : target;

  if (name === 'unknown' || detection.api === null) {
    return null;
  }

  const manifestVersion = readManifestVersion(detection.api);
  const api = detection.api;
  const callbackBased = detection.callbackBased;

  switch (name) {
    case 'chrome':
      return createChromeAdapter({ api, manifestVersion, callbackBased });
    case 'chromium':
      return createChromiumAdapter({
        target: 'chromium',
        api,
        manifestVersion,
        callbackBased,
      });
    case 'edge':
      return createEdgeAdapter({ api, manifestVersion, callbackBased });
    case 'firefox':
      return createFirefoxAdapter({ api, manifestVersion });
    default:
      return null;
  }
}

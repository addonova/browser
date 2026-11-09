import type { ManifestVersion } from '../../shared/capabilities.ts';
import type { BrowserAdapter } from '../types.ts';
import { createChromiumAdapter } from '../chromium/index.ts';

export interface ChromeAdapterOptions {
  api: unknown;
  manifestVersion: ManifestVersion | null;
  callbackBased?: boolean;
}

export function createChromeAdapter(
  options: ChromeAdapterOptions,
): BrowserAdapter {
  return createChromiumAdapter({
    target: 'chrome',
    api: options.api,
    manifestVersion: options.manifestVersion,
    ...(options.callbackBased === undefined
      ? {}
      : { callbackBased: options.callbackBased }),
  });
}

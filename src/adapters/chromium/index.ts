import type { ManifestVersion } from '../../shared/capabilities.ts';
import type { BrowserAdapter } from '../types.ts';
import {
  createAdapter,
  type CapabilityOverride,
} from '../shared/adapter.ts';

export interface ChromiumAdapterOptions {
  target: 'chrome' | 'chromium' | 'edge';
  api: unknown;
  manifestVersion: ManifestVersion | null;
  callbackBased?: boolean;
  overrides?: CapabilityOverride;
}

export function createChromiumAdapter(
  options: ChromiumAdapterOptions,
): BrowserAdapter {
  return createAdapter({
    target: options.target,
    engine: 'chromium',
    callbackBased: options.callbackBased ?? true,
    api: options.api,
    manifestVersion: options.manifestVersion,
    ...(options.overrides === undefined ? {} : { overrides: options.overrides }),
  });
}

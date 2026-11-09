import type { ManifestVersion } from '../../shared/capabilities.ts';
import type { BrowserAdapter } from '../types.ts';
import {
  createAdapter,
  type CapabilityOverride,
} from '../shared/adapter.ts';

export interface FirefoxAdapterOptions {
  api: unknown;
  manifestVersion: ManifestVersion | null;
  overrides?: CapabilityOverride;
}

export function createFirefoxAdapter(
  options: FirefoxAdapterOptions,
): BrowserAdapter {
  return createAdapter({
    target: 'firefox',
    engine: 'gecko',
    callbackBased: false,
    api: options.api,
    manifestVersion: options.manifestVersion,
    ...(options.overrides === undefined ? {} : { overrides: options.overrides }),
  });
}

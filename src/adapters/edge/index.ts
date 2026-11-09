import type { ManifestVersion } from '../../shared/capabilities.ts';
import type { BrowserAdapter } from '../types.ts';
import { createChromiumAdapter } from '../chromium/index.ts';
import type { CapabilityOverride } from '../shared/adapter.ts';

export interface EdgeAdapterOptions {
  api: unknown;
  manifestVersion: ManifestVersion | null;
  callbackBased?: boolean;
  overrides?: CapabilityOverride;
}

export function createEdgeAdapter(
  options: EdgeAdapterOptions,
): BrowserAdapter {
  return createChromiumAdapter({
    target: 'edge',
    api: options.api,
    manifestVersion: options.manifestVersion,
    ...(options.callbackBased === undefined
      ? {}
      : { callbackBased: options.callbackBased }),
    ...(options.overrides === undefined ? {} : { overrides: options.overrides }),
  });
}

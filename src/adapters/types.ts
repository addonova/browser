import type {
  BrowserEngine,
  BrowserTarget,
  CapabilityProvider,
  ManifestVersion,
} from '../shared/capabilities.ts';

export interface BrowserAdapter extends CapabilityProvider {
  readonly target: BrowserTarget;
  readonly engine: BrowserEngine;
  readonly manifestVersion: ManifestVersion | null;
  readonly callbackBased: boolean;
  readonly api: unknown;
  namespace<T = unknown>(name: string): T | undefined;
}

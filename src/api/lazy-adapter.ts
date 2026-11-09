import type { BrowserAdapter } from '../adapters/types.ts';
import { BrowserApiError } from '../shared/errors.ts';
import type {
  ApiAvailability,
  CapabilityQuery,
} from '../shared/capabilities.ts';

export type AdapterProvider = () => BrowserAdapter | null;

export function requireAdapter(
  provider: AdapterProvider,
): BrowserAdapter {
  const adapter = provider();

  if (adapter === null) {
    throw new BrowserApiError(
      'BROWSER_UNSUPPORTED_ENVIRONMENT',
      'The browser extension API is not available in this environment.',
    );
  }

  return adapter;
}

export function createLazyAdapter(
  provider: AdapterProvider,
): BrowserAdapter {
  return {
    get target() {
      return requireAdapter(provider).target;
    },
    get engine() {
      return requireAdapter(provider).engine;
    },
    get manifestVersion() {
      return requireAdapter(provider).manifestVersion;
    },
    get callbackBased() {
      return requireAdapter(provider).callbackBased;
    },
    get api(): unknown {
      return requireAdapter(provider).api;
    },
    namespace<T = unknown>(name: string): T | undefined {
      return requireAdapter(provider).namespace<T>(name);
    },
    supports(query: CapabilityQuery): boolean {
      return requireAdapter(provider).supports(query);
    },
    availability(query: CapabilityQuery): ApiAvailability {
      return requireAdapter(provider).availability(query);
    },
  };
}

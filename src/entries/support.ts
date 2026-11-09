import {
  normalizeQuery,
  unavailableCapability,
} from '../shared/capabilities.ts';
import type {
  ApiAvailability,
  CapabilityQuery,
} from '../shared/capabilities.ts';
import type { AdapterProvider } from '../api/lazy-adapter.ts';

export function isSupportedWith(provider: AdapterProvider): boolean {
  return provider() !== null;
}

export function supportsWith(
  provider: AdapterProvider,
  api: string | CapabilityQuery,
): boolean {
  const adapter = provider();
  return adapter === null ? false : adapter.supports(normalizeQuery(api));
}

export function availabilityWith(
  provider: AdapterProvider,
  api: string | CapabilityQuery,
): ApiAvailability {
  const query = normalizeQuery(api);
  const adapter = provider();

  return adapter === null
    ? unavailableCapability(query, 'unsupported-browser')
    : adapter.availability(query);
}

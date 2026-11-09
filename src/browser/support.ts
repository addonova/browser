import {
  normalizeQuery,
  unavailableCapability,
} from '../shared/capabilities.ts';
import type {
  ApiAvailability,
  CapabilityQuery,
} from '../shared/capabilities.ts';
import type { DetectBrowserOptions } from './detect.ts';
import { resolveAdapter } from './resolve.ts';

export { normalizeQuery };

export function isBrowserSupported(
  options: DetectBrowserOptions = {},
): boolean {
  return resolveAdapter(options) !== null;
}

export function supports(
  api: string | CapabilityQuery,
  options: DetectBrowserOptions = {},
): boolean {
  const adapter = resolveAdapter(options);
  return adapter === null ? false : adapter.supports(normalizeQuery(api));
}

export function getAvailability(
  api: string | CapabilityQuery,
  options: DetectBrowserOptions = {},
): ApiAvailability {
  const query = normalizeQuery(api);
  const adapter = resolveAdapter(options);

  return adapter === null
    ? unavailableCapability(query, 'unsupported-browser')
    : adapter.availability(query);
}



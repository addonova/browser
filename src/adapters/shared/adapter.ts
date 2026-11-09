import type {
  ApiAvailability,
  BrowserEngine,
  BrowserTarget,
  CapabilityQuery,
  ManifestVersion,
} from '../../shared/capabilities.ts';
import type { BrowserAdapter } from '../types.ts';
import { detectAvailability, readNamespace } from './namespace.ts';

export type CapabilityOverride = (
  query: CapabilityQuery,
  availability: ApiAvailability,
) => ApiAvailability;

export interface CreateAdapterOptions {
  target: BrowserTarget;
  engine: BrowserEngine;
  callbackBased: boolean;
  api: unknown;
  manifestVersion: ManifestVersion | null;
  overrides?: CapabilityOverride;
}

export function createAdapter(
  options: CreateAdapterOptions,
): BrowserAdapter {
  const availability = (query: CapabilityQuery): ApiAvailability => {
    const detected = detectAvailability(options.api, query);

    return options.overrides === undefined
      ? detected
      : options.overrides(query, detected);
  };

  return {
    target: options.target,
    engine: options.engine,
    manifestVersion: options.manifestVersion,
    callbackBased: options.callbackBased,
    api: options.api,
    namespace<T = unknown>(name: string): T | undefined {
      return readNamespace<T>(options.api, name);
    },
    supports(query: CapabilityQuery): boolean {
      return availability(query).available;
    },
    availability,
  };
}

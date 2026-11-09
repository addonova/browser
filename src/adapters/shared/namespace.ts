import {
  availableCapability,
  unavailableCapability,
} from '../../shared/capabilities.ts';
import type {
  ApiAvailability,
  CapabilityQuery,
} from '../../shared/capabilities.ts';
import { isRecord, readProperty } from '../../shared/objects.ts';

export function readNamespace<T = unknown>(
  api: unknown,
  name: string,
): T | undefined {
  const value = readProperty(api, name);

  return value === undefined ? undefined : (value as T);
}

export function detectAvailability(
  api: unknown,
  query: CapabilityQuery,
): ApiAvailability {
  const namespace = readNamespace<unknown>(api, query.namespace);

  if (namespace === undefined || namespace === null) {
    return unavailableCapability(query, 'missing-api');
  }

  if (query.method !== undefined) {
    const method = isRecord(namespace) ? namespace[query.method] : undefined;

    if (method === undefined) {
      return unavailableCapability(query, 'missing-api');
    }
  }

  return availableCapability(query);
}

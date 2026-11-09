export const BROWSER_TARGETS = [
  'chrome',
  'chromium',
  'firefox',
  'edge',
] as const;

export type BrowserTarget = (typeof BROWSER_TARGETS)[number];

export type BrowserEngine = 'chromium' | 'gecko' | 'unknown';

export type ManifestVersion = 2 | 3;

export type ApiAvailabilityReason =
  | 'missing-api'
  | 'missing-permission'
  | 'unsupported-manifest'
  | 'unsupported-browser';

export interface CapabilityQuery {
  readonly namespace: string;
  readonly method?: string;
}

export function normalizeQuery(
  api: string | CapabilityQuery,
): CapabilityQuery {
  if (typeof api !== 'string') {
    return api;
  }

  const separator = api.indexOf('.');

  return separator === -1
    ? { namespace: api }
    : {
        namespace: api.slice(0, separator),
        method: api.slice(separator + 1),
      };
}

export interface ApiAvailability {
  readonly namespace: string;
  readonly method?: string;
  readonly available: boolean;
  readonly reason?: ApiAvailabilityReason;
}

export interface CapabilityProvider {
  supports(query: CapabilityQuery): boolean;
  availability(query: CapabilityQuery): ApiAvailability;
}

export function isBrowserTarget(value: unknown): value is BrowserTarget {
  return (
    typeof value === 'string' &&
    (BROWSER_TARGETS as readonly string[]).includes(value)
  );
}

export function isManifestVersion(value: unknown): value is ManifestVersion {
  return value === 2 || value === 3;
}

export function availableCapability(query: CapabilityQuery): ApiAvailability {
  return {
    namespace: query.namespace,
    ...(query.method === undefined ? {} : { method: query.method }),
    available: true,
  };
}

export function unavailableCapability(
  query: CapabilityQuery,
  reason: ApiAvailabilityReason,
): ApiAvailability {
  return {
    namespace: query.namespace,
    ...(query.method === undefined ? {} : { method: query.method }),
    available: false,
    reason,
  };
}

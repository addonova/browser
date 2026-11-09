export {
  BrowserApiError,
  isBrowserApiError,
  isPermissionError,
  normalizeBrowserApiError,
} from '../shared/errors.ts';
export type {
  BrowserApiErrorCode,
  BrowserApiErrorOptions,
  NormalizeBrowserApiErrorOptions,
} from '../shared/errors.ts';

export {
  callbackToPromise,
  isPromiseLike,
  promisifyMethod,
  readLastError,
  resolveMaybePromise,
} from '../shared/promises.ts';
export type { Callback, CallbackOptions } from '../shared/promises.ts';

export {
  isBrowserEvent,
  passthroughEvent,
  requireEvent,
} from '../shared/events.ts';
export type { BrowserEvent, BrowserEventListener } from '../shared/events.ts';

export {
  BROWSER_TARGETS,
  availableCapability,
  isBrowserTarget,
  isManifestVersion,
  unavailableCapability,
} from '../shared/capabilities.ts';
export type {
  ApiAvailability,
  ApiAvailabilityReason,
  BrowserEngine,
  BrowserTarget,
  CapabilityProvider,
  CapabilityQuery,
  ManifestVersion,
} from '../shared/capabilities.ts';

export type { BrowserAdapter } from '../adapters/types.ts';

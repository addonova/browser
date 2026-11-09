import type { BrowserAdapter } from '../adapters/types.ts';
import type {
  ApiAvailabilityReason,
  CapabilityQuery,
} from '../shared/capabilities.ts';
import { BrowserApiError, normalizeBrowserApiError } from '../shared/errors.ts';
import type { BrowserEvent } from '../shared/events.ts';
import { isBrowserEvent } from '../shared/events.ts';
import { callbackToPromise } from '../shared/promises.ts';
import { readProperty } from '../shared/objects.ts';

export type ApiPath = readonly [namespace: string, ...rest: string[]];

type AnyFunction = (...args: unknown[]) => unknown;

export function unsupportedApiError(
  api: string,
  reason?: ApiAvailabilityReason,
): BrowserApiError {
  if (reason === 'missing-permission') {
    return new BrowserApiError(
      'BROWSER_PERMISSION_DENIED',
      `The permission required for the browser API "${api}" has not been granted.`,
      { api },
    );
  }

  return new BrowserApiError(
    'BROWSER_UNSUPPORTED_API',
    `The browser API "${api}" is not available in this environment.`,
    { api },
  );
}

export function requireCapability(
  adapter: BrowserAdapter,
  path: ApiPath,
): void {
  const availability = adapter.availability(capabilityQuery(path));

  if (!availability.available) {
    throw unsupportedApiError(path.join('.'), availability.reason);
  }
}

export function requireNamespace<T = unknown>(
  adapter: BrowserAdapter,
  namespace: string,
): T {
  requireCapability(adapter, [namespace]);
  const value = adapter.namespace<T>(namespace);

  if (value === undefined) {
    throw unsupportedApiError(namespace);
  }

  return value;
}

export function requireMethod<FunctionType extends AnyFunction>(
  adapter: BrowserAdapter,
  path: ApiPath,
): FunctionType {
  requireCapability(adapter, path);
  const method = readPathValue(adapter, path);

  if (typeof method !== 'function') {
    throw unsupportedApiError(path.join('.'));
  }

  return method as FunctionType;
}

export function requireEvent<TEvent extends BrowserEvent>(
  adapter: BrowserAdapter,
  path: ApiPath,
): TEvent {
  requireCapability(adapter, path);
  const event = readPathValue(adapter, path);

  if (!isBrowserEvent(event)) {
    throw unsupportedApiError(path.join('.'));
  }

  return event as TEvent;
}

export function callSync<Result>(
  adapter: BrowserAdapter,
  path: ApiPath,
  ...args: unknown[]
): Result {
  const method = requireMethod<AnyFunction>(adapter, path);

  try {
    return method(...args) as Result;
  } catch (error) {
    throw normalizeBrowserApiError(error, { api: path.join('.') });
  }
}

export function callAsync<Result>(
  adapter: BrowserAdapter,
  path: ApiPath,
  ...args: unknown[]
): Promise<Result> {
  const method = requireMethod<AnyFunction>(adapter, path);
  const api = path.join('.');

  if (!adapter.callbackBased) {
    try {
      return Promise.resolve(method(...args) as Result | PromiseLike<Result>);
    } catch (error) {
      return Promise.reject(normalizeBrowserApiError(error, { api }));
    }
  }

  return callbackToPromise<Result>(
    (callback) => {
      method(...args, callback);
    },
    { scope: adapter.api, api },
  );
}

export function callVoid(
  adapter: BrowserAdapter,
  path: ApiPath,
  ...args: unknown[]
): Promise<void> {
  const method = requireMethod<AnyFunction>(adapter, path);
  const api = path.join('.');

  try {
    const result = method(...args);

    return Promise.resolve(result).then(
      () => undefined,
      (error: unknown) => {
        throw normalizeBrowserApiError(error, { api });
      },
    );
  } catch (error) {
    return Promise.reject(normalizeBrowserApiError(error, { api }));
  }
}

export function isCapabilityAvailable(
  adapter: BrowserAdapter,
  path: ApiPath,
): boolean {
  try {
    return adapter.availability(capabilityQuery(path)).available;
  } catch {
    return false;
  }
}

function capabilityQuery(path: ApiPath): CapabilityQuery {
  const namespace = path[0];

  return path.length === 1
    ? { namespace }
    : { namespace, method: path[1] as string };
}

function readPathValue(adapter: BrowserAdapter, path: ApiPath): unknown {
  const [namespace, ...rest] = path;
  let current: unknown = adapter.namespace(namespace);

  for (const key of rest) {
    current = readProperty(current, key);
  }

  return current;
}

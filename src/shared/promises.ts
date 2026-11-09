import {
  BrowserApiError,
  isPermissionError,
  normalizeBrowserApiError,
} from './errors.ts';

export type Callback<Result> = (result: Result) => void;

export interface CallbackOptions {
  scope?: unknown;
  api?: string;
}

export function readLastError(scope: unknown): string | null {
  if (!isRecord(scope)) {
    return null;
  }

  const runtime = scope.runtime;

  if (!isRecord(runtime)) {
    return null;
  }

  const lastError = runtime.lastError;

  if (!isRecord(lastError)) {
    return null;
  }

  const message = lastError.message;

  if (typeof message === 'string' && message !== '') {
    return message;
  }

  return 'The browser extension API reported an unknown error.';
}

export function callbackToPromise<TResult>(
  run: (callback: Callback<TResult>) => void,
  options: CallbackOptions = {},
): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    let settled = false;

    const rejectWith = (error: unknown): void => {
      reject(
        normalizeBrowserApiError(error, {
          ...(options.api === undefined ? {} : { api: options.api }),
        }),
      );
    };

    const settle = (result: TResult): void => {
      if (settled) {
        return;
      }

      settled = true;
      const lastError = readLastError(options.scope);

      if (lastError !== null) {
        reject(
          new BrowserApiError(
            isPermissionError(lastError)
              ? 'BROWSER_PERMISSION_DENIED'
              : 'BROWSER_API_FAILED',
            lastError,
            options.api === undefined ? {} : { api: options.api },
          ),
        );
        return;
      }

      resolve(result);
    };

    try {
      run(settle);
    } catch (error) {
      if (settled) {
        return;
      }

      settled = true;
      rejectWith(error);
    }
  });
}

export function promisifyMethod<Args extends unknown[], Result>(
  method: (...args: [...Args, Callback<Result>]) => void,
  options: CallbackOptions = {},
): (...args: Args) => Promise<Result> {
  return (...args: Args): Promise<Result> =>
    callbackToPromise<Result>((callback) => {
      method(...args, callback);
    }, options);
}

export function isPromiseLike<T>(
  value: T | PromiseLike<T>,
): value is PromiseLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

export function resolveMaybePromise<T>(
  value: T | PromiseLike<T>,
): Promise<T> {
  return Promise.resolve(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

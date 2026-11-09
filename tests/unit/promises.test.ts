import { describe, expect, it } from '@guchho/test';

import {
  BrowserApiError,
  isBrowserApiError,
} from '../../src/shared/errors.ts';
import {
  callbackToPromise,
  isPromiseLike,
  promisifyMethod,
  readLastError,
  resolveMaybePromise,
} from '../../src/shared/promises.ts';

describe('callbackToPromise', () => {
  it('resolves the callback result', async () => {
    const result = await callbackToPromise<string>((callback) => {
      callback('value');
    });

    expect(result).toBe('value');
  });

  it('rejects when the runtime reports a last error', async () => {
    const scope = { runtime: { lastError: { message: 'Tabs unavailable' } } };

    try {
      await callbackToPromise<string>((callback) => {
        callback('value');
      }, { scope, api: 'tabs.query' });
      throw new Error('expected rejection');
    } catch (error) {
      expect(isBrowserApiError(error)).toBe(true);
      expect((error as BrowserApiError).code).toBe('BROWSER_API_FAILED');
      expect((error as BrowserApiError).api).toBe('tabs.query');
    }
  });

  it('rejects permission errors with a permission code', async () => {
    const scope = {
      runtime: { lastError: { message: 'Permission denied' } },
    };

    try {
      await callbackToPromise<void>((callback) => {
        callback(undefined);
      }, { scope });
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe('BROWSER_PERMISSION_DENIED');
    }
  });

  it('rejects when the callback invocation throws', async () => {
    try {
      await callbackToPromise<void>(() => {
        throw new Error('boom');
      });
      throw new Error('expected rejection');
    } catch (error) {
      expect(isBrowserApiError(error)).toBe(true);
      expect((error as BrowserApiError).message).toBe('boom');
    }
  });
});

describe('promisifyMethod', () => {
  it('passes arguments through and resolves the result', async () => {
    const method = (
      value: number,
      callback: (result: number) => void,
    ): void => {
      callback(value * 2);
    };

    const promisified = promisifyMethod(method);
    await expect(promisified(21)).resolves.toBe(42);
  });
});

describe('readLastError', () => {
  it('returns null when there is no runtime error', () => {
    expect(readLastError(undefined)).toBeNull();
    expect(readLastError({})).toBeNull();
    expect(readLastError({ runtime: {} })).toBeNull();
  });

  it('returns the reported message', () => {
    expect(
      readLastError({ runtime: { lastError: { message: 'Failure' } } }),
    ).toBe('Failure');
  });
});

describe('resolveMaybePromise', () => {
  it('recognizes promise-like values', () => {
    expect(isPromiseLike(Promise.resolve(1))).toBe(true);
    expect(isPromiseLike(1)).toBe(false);
  });

  it('returns an existing native promise unchanged', () => {
    const promise = Promise.resolve(1);
    expect(resolveMaybePromise(promise)).toBe(promise);
  });
});

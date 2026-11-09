import { describe, expect, it } from '@guchho/test';

import {
  BrowserApiError,
  isBrowserApiError,
  isPermissionError,
  normalizeBrowserApiError,
} from '../../src/shared/errors.ts';

describe('BrowserApiError', () => {
  it('carries a code, message, and api', () => {
    const error = new BrowserApiError(
      'BROWSER_UNSUPPORTED_API',
      'Not available',
      { api: 'tabs.onCreated' },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BrowserApiError');
    expect(error.code).toBe('BROWSER_UNSUPPORTED_API');
    expect(error.message).toBe('Not available');
    expect(error.api).toBe('tabs.onCreated');
  });

  it('preserves a cause', () => {
    const cause = new Error('root cause');
    const error = new BrowserApiError('BROWSER_API_FAILED', 'Failed', { cause });

    expect(error.cause).toBe(cause);
  });

  it('detects browser api errors', () => {
    expect(isBrowserApiError(new BrowserApiError('BROWSER_API_FAILED', 'x'))).toBe(
      true,
    );
    expect(isBrowserApiError(new Error('plain'))).toBe(false);
  });

  it('normalizes plain errors and preserves the cause', () => {
    const cause = new Error('plain failure');
    const error = normalizeBrowserApiError(cause, { api: 'storage.local.get' });

    expect(error).toBeInstanceOf(BrowserApiError);
    expect(error.code).toBe('BROWSER_API_FAILED');
    expect(error.message).toBe('plain failure');
    expect(error.api).toBe('storage.local.get');
    expect(error.cause).toBe(cause);
  });

  it('detects permission failures', () => {
    expect(isPermissionError(new Error('Permission denied'))).toBe(true);
    expect(isPermissionError(new Error('Access to host is not allowed'))).toBe(
      true,
    );
    expect(isPermissionError(new Error('Something else'))).toBe(false);

    const error = normalizeBrowserApiError(new Error('Permission denied'));
    expect(error.code).toBe('BROWSER_PERMISSION_DENIED');
  });
});

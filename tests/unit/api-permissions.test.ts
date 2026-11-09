import { describe, expect, it } from '@guchho/test';

import { createChromeAdapter } from '../../src/adapters/chrome/index.ts';
import { createPermissionsApi } from '../../src/api/permissions/index.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  createCallbackMethod,
  createEvent,
} from '../helpers/fakes.ts';

function createPermissionsFixture() {
  const calls: unknown[][] = [];
  const onAdded = createEvent();
  const onRemoved = createEvent();
  const runtimeApi = {
    id: 'test-id',
    lastError: undefined as { message?: string } | undefined,
  };
  const api = {
    runtime: runtimeApi,
    permissions: {
      contains: createCallbackMethod(true, calls),
      request: createCallbackMethod(true, calls),
      remove: createCallbackMethod(false, calls),
      getAll: createCallbackMethod(
        { permissions: ['storage'], origins: ['https://example.com/*'] },
        calls,
      ),
      onAdded,
      onRemoved,
    },
  };

  return {
    calls,
    onAdded,
    onRemoved,
    runtimeApi,
    permissions: createPermissionsApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    ),
  };
}

describe('permissions module', () => {
  it('contains, requests, removes, and lists permissions', async () => {
    const { permissions, calls } = createPermissionsFixture();
    const request = { permissions: ['tabs'] };

    await expect(permissions.contains(request)).resolves.toBe(true);
    await expect(permissions.request(request)).resolves.toBe(true);
    await expect(permissions.remove(request)).resolves.toBe(false);
    await expect(permissions.getAll()).resolves.toEqual({
      permissions: ['storage'],
      origins: ['https://example.com/*'],
    });

    expect(calls).toEqual([
      [request],
      [request],
      [request],
      [],
    ]);
  });

  it('does not request permissions automatically', () => {
    const { calls } = createPermissionsFixture();

    expect(calls).toEqual([]);
  });

  it('preserves permission errors from the browser', async () => {
    const { permissions, runtimeApi } = createPermissionsFixture();
    runtimeApi.lastError = { message: 'Permission denied' };

    try {
      await permissions.request({ permissions: ['tabs'] });
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_PERMISSION_DENIED',
      );
      expect((error as BrowserApiError).api).toBe(
        'permissions.request',
      );
    }
  });

  it('passes permission events through unchanged', () => {
    const { permissions, onAdded, onRemoved } =
      createPermissionsFixture();

    expect(permissions.onAdded).toBe(onAdded);
    expect(permissions.onRemoved).toBe(onRemoved);

    let added: unknown = null;
    permissions.onAdded.addListener((value) => {
      added = value;
    });
    onAdded.emit({ permissions: ['tabs'] });
    expect(added).toEqual({ permissions: ['tabs'] });
  });

  it('throws a typed error for a missing method', async () => {
    const api = {
      permissions: {
        contains: createCallbackMethod(true),
      },
    };
    const permissions = createPermissionsApi(
      createChromeAdapter({ api, manifestVersion: 3 }),
    );

    try {
      await permissions.request({ permissions: ['tabs'] });
      throw new Error('expected rejection');
    } catch (error) {
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
      expect((error as BrowserApiError).api).toBe(
        'permissions.request',
      );
    }
  });
});

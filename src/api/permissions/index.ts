import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Permissions,
  PermissionsApi,
} from '../../types/permissions.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createPermissionsApi(
  adapter: BrowserAdapter,
): PermissionsApi {
  return {
    contains(permissions: Permissions): Promise<boolean> {
      return callAsync<boolean>(
        adapter,
        ['permissions', 'contains'],
        permissions,
      );
    },
    request(permissions: Permissions): Promise<boolean> {
      return callAsync<boolean>(
        adapter,
        ['permissions', 'request'],
        permissions,
      );
    },
    remove(permissions: Permissions): Promise<boolean> {
      return callAsync<boolean>(
        adapter,
        ['permissions', 'remove'],
        permissions,
      );
    },
    getAll(): Promise<Permissions> {
      return callAsync<Permissions>(
        adapter,
        ['permissions', 'getAll'],
      );
    },
    get onAdded() {
      return requireEvent<
        PermissionsApi['onAdded']
      >(adapter, ['permissions', 'onAdded']);
    },
    get onRemoved() {
      return requireEvent<
        PermissionsApi['onRemoved']
      >(adapter, ['permissions', 'onRemoved']);
    },
  };
}


export type {
  Permissions,
  PermissionsApi,
} from '../../types/permissions.ts';

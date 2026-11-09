import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  StorageApi,
  StorageArea,
  StorageAreaName,
  StorageItems,
  StorageKeys,
} from '../../types/storage.ts';
import {
  callAsync,
  isCapabilityAvailable,
  requireEvent,
} from '../helpers.ts';

export function createStorageArea<
  T extends StorageItems = StorageItems,
>(
  adapter: BrowserAdapter,
  area: StorageAreaName,
): StorageArea<T> {
  const path = (method: string) =>
    ['storage', area, method] as const;

  const get = ((keys?: unknown): Promise<StorageItems> => {
    const target = path('get');

    return keys === undefined
      ? callAsync<StorageItems>(adapter, target)
      : callAsync<StorageItems>(adapter, target, keys);
  }) as unknown as StorageArea<T>['get'];

  return {
    get,
    set(items: Partial<T> | StorageItems): Promise<void> {
      return callAsync<void>(adapter, path('set'), items);
    },
    remove(
      keys:
        | keyof T
        | readonly (keyof T)[]
        | StorageKeys
        | null,
    ): Promise<void> {
      return callAsync<void>(adapter, path('remove'), keys);
    },
    clear(): Promise<void> {
      return callAsync<void>(adapter, path('clear'));
    },
    getBytesInUse(keys?: StorageKeys | null): Promise<number> {
      const target = path('getBytesInUse');

      return keys === undefined || keys === null
        ? callAsync<number>(adapter, target)
        : callAsync<number>(adapter, target, keys);
    },
  };
}

export function createStorageApi(adapter: BrowserAdapter): StorageApi {
  return {
    get local() {
      return createStorageArea(adapter, 'local');
    },
    get sync() {
      return createStorageArea(adapter, 'sync');
    },
    get session() {
      return createStorageArea(adapter, 'session');
    },
    get managed() {
      return createStorageArea(adapter, 'managed');
    },
    isAreaAvailable(area: StorageAreaName): boolean {
      return isCapabilityAvailable(adapter, ['storage', area]);
    },
    getBytesInUse(
      area: StorageAreaName,
      keys?: StorageKeys | null,
    ): Promise<number> {
      const target = ['storage', area, 'getBytesInUse'] as const;

      return keys === undefined || keys === null
        ? callAsync<number>(adapter, target)
        : callAsync<number>(adapter, target, keys);
    },
    get onChanged() {
      return requireEvent<
        StorageApi['onChanged']
      >(adapter, ['storage', 'onChanged']);
    },
  };
}


export type {
  StorageApi,
  StorageArea,
  StorageAreaName,
  StorageChange,
  StorageChanges,
  StorageItems,
  StorageKeys,
} from '../../types/storage.ts';

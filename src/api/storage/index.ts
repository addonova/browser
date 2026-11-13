import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  StorageApi,
  StorageAreaName,
  StorageItem,
  StorageItemOptions,
  StorageKeys,
} from '../../types/storage.ts';
import {
  callAsync,
  isCapabilityAvailable,
  requireEvent,
} from '../helpers.ts';
import { createStorageArea } from './area.ts';
import { createStorageItem } from './item.ts';

export function createStorageApi(adapter: BrowserAdapter): StorageApi {
  return {
    defineItem<T>(
      key: string,
      options?: StorageItemOptions<T>,
    ): StorageItem<T> {
      return createStorageItem(adapter, key, options);
    },
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


export { createStorageArea } from './area.ts';
export { createStorageItem } from './item.ts';

export type {
  StorageApi,
  StorageAreaName,
  StorageChange,
  StorageChanges,
  StorageItem,
  StorageItemMeta,
  StorageItemOptions,
  StorageItemValue,
  StorageItems,
  StorageKeys,
} from '../../types/storage.ts';

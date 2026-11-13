import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  StorageAreaName,
  StorageChange,
  StorageChanges,
  StorageItem,
  StorageItemMeta,
  StorageItemOptions,
} from '../../types/storage.ts';
import { BrowserApiError } from '../../shared/errors.ts';
import { requireEvent } from '../helpers.ts';
import { createStorageArea } from './area.ts';

const META_SUFFIX = '::meta';

export function createStorageItem<T>(
  adapter: BrowserAdapter,
  key: string,
  options: StorageItemOptions<T> = {},
): StorageItem<T> {
  const area = options.area ?? 'local';
  const storageArea = createStorageArea(adapter, area);
  const metaKey = `${key}${META_SUFFIX}`;
  const targetVersion = options.version ?? 1;

  const readValue = async (): Promise<unknown> => {
    const items = await storageArea.get(key);

    return Object.prototype.hasOwnProperty.call(items, key)
      ? items[key]
      : undefined;
  };

  const getMeta = async (): Promise<StorageItemMeta> => {
    const raw = await storageArea.get(metaKey);
    const value = raw[metaKey];

    if (isStorageItemMeta(value)) {
      return value;
    }

    return { version: 1 };
  };

  const setMeta = async (meta: StorageItemMeta): Promise<void> => {
    await storageArea.set({ [metaKey]: meta });
  };

  const resolveInitialValue = async (): Promise<T> => {
    if (options.init !== undefined) {
      const value = await options.init();
      await setValue(value);
      return value;
    }

    if ('fallback' in options) {
      return options.fallback as T;
    }

    throw new BrowserApiError(
      'BROWSER_API_FAILED',
      `Storage item "${key}" has no value and no fallback or init option.`,
      { api: `storage.${area}.get` },
    );
  };

  const migrate = async (value: unknown): Promise<unknown> => {
    const meta = await getMeta();

    if (meta.version >= targetVersion) {
      return value;
    }

    let migrated = value;

    for (let version = meta.version + 1; version <= targetVersion; version += 1) {
      const migration = options.migrations?.[version];

      if (migration !== undefined) {
        migrated = await migration(migrated);
      }
    }

    await storageArea.set({ [key]: migrated });
    await setMeta({ ...meta, version: targetVersion });

    return migrated;
  };

  const setValue = async (value: T): Promise<void> => {
    await storageArea.set({ [key]: value });

    if (targetVersion !== 1 || options.migrations !== undefined) {
      await setMeta({ ...(await getMeta()), version: targetVersion });
    }
  };

  const getValue = async (): Promise<T> => {
    const value = await readValue();

    if (value === undefined) {
      return resolveInitialValue();
    }

    return (await migrate(value)) as T;
  };

  return {
    key,
    area,
    getValue,
    setValue,
    async removeValue(): Promise<void> {
      await storageArea.remove(key);
    },
    getMeta,
    setMeta,
    watch(
      callback: (newValue: T, oldValue: T | undefined) => void,
    ): () => void {
      const event = requireEvent<{
        addListener(
          listener: (
            changes: StorageChanges,
            areaName: StorageAreaName,
          ) => void,
        ): void;
        removeListener(
          listener: (
            changes: StorageChanges,
            areaName: StorageAreaName,
          ) => void,
        ): void;
      }>(adapter, ['storage', 'onChanged']);

      const listener = (
        changes: StorageChanges,
        areaName: StorageAreaName,
      ): void => {
        if (areaName !== area) {
          return;
        }

        const change = changes[key];

        if (change === undefined) {
          return;
        }

        void resolveChangedValue(change, getValue)
          .then((newValue) => {
            callback(newValue, change.oldValue as T | undefined);
          })
          .catch(() => {});
      };

      event.addListener(listener);

      return () => event.removeListener(listener);
    },
  };
}

async function resolveChangedValue<T>(
  change: StorageChange,
  getValue: () => Promise<T>,
): Promise<T> {
  if (change.newValue !== undefined) {
    return change.newValue as T;
  }

  return getValue();
}

function isStorageItemMeta(value: unknown): value is StorageItemMeta {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { version?: unknown }).version === 'number'
  );
}

import type { BrowserEvent } from '../shared/events.ts';

export type StorageAreaName = 'local' | 'sync' | 'session' | 'managed';

export type StorageItems = Record<string, unknown>;

export interface StorageChange {
  readonly oldValue?: unknown;
  readonly newValue?: unknown;
}

export type StorageChanges = Record<string, StorageChange>;

export type StorageKeys = string | readonly string[];

export interface StorageArea<T extends StorageItems = StorageItems> {
  get(): Promise<T>;
  get<Key extends keyof T & string>(
    keys: Key | readonly Key[] | null,
  ): Promise<Pick<T, Key>>;
  get(keys: StorageKeys | Record<string, unknown> | null): Promise<StorageItems>;
  set(items: Partial<T> | StorageItems): Promise<void>;
  remove(
    keys:
      | keyof T
      | readonly (keyof T)[]
      | StorageKeys
      | null,
  ): Promise<void>;
  clear(): Promise<void>;
  getBytesInUse(keys?: StorageKeys | null): Promise<number>;
}

export interface StorageApi {
  readonly local: StorageArea;
  readonly sync: StorageArea;
  readonly session: StorageArea;
  readonly managed: StorageArea;
  isAreaAvailable(area: StorageAreaName): boolean;
  getBytesInUse(
    area: StorageAreaName,
    keys?: StorageKeys | null,
  ): Promise<number>;
  readonly onChanged: BrowserEvent<
    (changes: StorageChanges, areaName: StorageAreaName) => void
  >;
}

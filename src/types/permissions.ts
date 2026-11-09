import type { BrowserEvent } from '../shared/events.ts';

export interface Permissions {
  readonly permissions?: readonly string[];
  readonly origins?: readonly string[];
}

export interface PermissionsApi {
  contains(permissions: Permissions): Promise<boolean>;
  request(permissions: Permissions): Promise<boolean>;
  remove(permissions: Permissions): Promise<boolean>;
  getAll(): Promise<Permissions>;
  readonly onAdded: BrowserEvent<(permissions: Permissions) => void>;
  readonly onRemoved: BrowserEvent<(permissions: Permissions) => void>;
}

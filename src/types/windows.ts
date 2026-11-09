import type { Tab } from './tabs.ts';

export interface Window {
  readonly id?: number;
  readonly focused: boolean;
  readonly incognito?: boolean;
  readonly type?: string;
  readonly state?: string;
  readonly alwaysOnTop?: boolean;
  readonly tabs?: readonly Tab[];
  readonly width?: number;
  readonly height?: number;
  readonly left?: number;
  readonly top?: number;
  readonly sessionId?: string;
  [key: string]: unknown;
}

export interface WindowGetInfo {
  readonly populate?: boolean;
  readonly windowTypes?: readonly string[];
  [key: string]: unknown;
}

export interface WindowCreateProperties {
  readonly url?: string | readonly string[];
  readonly tabId?: number;
  readonly type?: string;
  readonly state?: string;
  readonly incognito?: boolean;
  readonly focused?: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly left?: number;
  readonly top?: number;
  [key: string]: unknown;
}

export interface WindowUpdateProperties {
  readonly focused?: boolean;
  readonly drawAttention?: boolean;
  readonly state?: string;
  readonly left?: number;
  readonly top?: number;
  readonly width?: number;
  readonly height?: number;
  [key: string]: unknown;
}

export interface WindowsApi {
  getCurrent(getInfo?: WindowGetInfo): Promise<Window>;
  create(createData?: WindowCreateProperties): Promise<Window>;
  update(
    windowId: number,
    updateInfo: WindowUpdateProperties,
  ): Promise<Window>;
  remove(windowId: number): Promise<void>;
  getAll(getInfo?: WindowGetInfo): Promise<Window[]>;
}

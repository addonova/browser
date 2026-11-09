import type { BrowserEvent } from '../shared/events.ts';

export interface MutedInfo {
  readonly muted: boolean;
  readonly reason?: string;
  readonly extensionId?: string;
}

export interface Tab {
  readonly id?: number;
  readonly index: number;
  readonly windowId: number;
  readonly active: boolean;
  readonly highlighted: boolean;
  readonly pinned: boolean;
  readonly incognito: boolean;
  readonly url?: string;
  readonly pendingUrl?: string;
  readonly title?: string;
  readonly favIconUrl?: string;
  readonly status?: string;
  readonly audible?: boolean;
  readonly mutedInfo?: MutedInfo;
  readonly discarded?: boolean;
  readonly autoDiscardable?: boolean;
  readonly groupId?: number;
  readonly openerTabId?: number;
  readonly sessionId?: string;
  readonly splitViewId?: number;
  [key: string]: unknown;
}

export interface TabsQuery {
  readonly active?: boolean;
  readonly currentWindow?: boolean;
  readonly lastFocusedWindow?: boolean;
  readonly windowId?: number;
  readonly windowType?: string;
  readonly status?: string;
  readonly url?: string | readonly string[];
  readonly title?: string;
  readonly index?: number;
  readonly pinned?: boolean;
  readonly audible?: boolean;
  readonly muted?: boolean;
  readonly highlighted?: boolean;
  readonly discarded?: boolean;
  readonly autoDiscardable?: boolean;
  readonly groupId?: number;
  readonly hidden?: boolean;
  [key: string]: unknown;
}

export interface TabCreateProperties {
  readonly windowId?: number;
  readonly index?: number;
  readonly url?: string;
  readonly active?: boolean;
  readonly selected?: boolean;
  readonly pinned?: boolean;
  readonly openerTabId?: number;
  readonly discarded?: boolean;
  readonly autoDiscardable?: boolean;
  [key: string]: unknown;
}

export interface TabUpdateProperties {
  readonly url?: string;
  readonly active?: boolean;
  readonly highlighted?: boolean;
  readonly pinned?: boolean;
  readonly muted?: boolean;
  readonly openerTabId?: number;
  readonly autoDiscardable?: boolean;
  [key: string]: unknown;
}

export interface TabReloadProperties {
  readonly bypassCache?: boolean;
  [key: string]: unknown;
}

export interface TabQueryInfo {
  readonly populate?: boolean;
  [key: string]: unknown;
}

export interface TabsApi {
  query(queryInfo?: TabsQuery): Promise<Tab[]>;
  get(tabId: number): Promise<Tab>;
  create(createProperties: TabCreateProperties): Promise<Tab>;
  update(tabId: number, updateProperties: TabUpdateProperties): Promise<Tab>;
  remove(tabIds: number | readonly number[]): Promise<void>;
  reload(tabId?: number, reloadProperties?: TabReloadProperties): Promise<void>;
  sendMessage<T = unknown>(
    tabId: number,
    message: unknown,
    options?: TabQueryInfo,
  ): Promise<T>;
  readonly onCreated: BrowserEvent<(tab: Tab) => void>;
  readonly onUpdated: BrowserEvent<
    (tabId: number, changeInfo: Record<string, unknown>, tab: Tab) => void
  >;
  readonly onRemoved: BrowserEvent<
    (tabId: number, removeInfo: Record<string, unknown>) => void
  >;
  readonly onActivated: BrowserEvent<
    (activeInfo: { readonly tabId: number; readonly windowId: number }) => void
  >;
}

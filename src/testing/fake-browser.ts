import type { BrowserTarget } from '../shared/capabilities.ts';
import { clearAdapterCache } from '../browser/resolve.ts';
import type {
  InjectionResult,
  ScriptInjection,
} from '../types/scripting.ts';
import type {
  StorageAreaName,
  StorageChange,
  StorageChanges,
} from '../types/storage.ts';
import type {
  MessageSender,
  SendResponse,
} from '../types/runtime.ts';
import type { Tab } from '../types/tabs.ts';
import type { Window } from '../types/windows.ts';

export type FakeEvent<Args extends readonly unknown[] = readonly unknown[]> =
  {
    addListener(listener: (...args: Args) => unknown): void;
    removeListener(listener: (...args: Args) => unknown): void;
    hasListener(listener: (...args: Args) => unknown): boolean;
    hasListeners(): boolean;
    emit(...args: Args): void;
    dispatch(...args: Args): unknown[];
    clear(): void;
    readonly listenerCount: number;
  };

export interface FakeBrowserOptions {
  readonly target?: BrowserTarget;
  readonly id?: string;
  readonly manifest?: Readonly<Record<string, unknown>>;
  readonly messages?: Readonly<
    Record<string, string | { readonly message: string }>
  >;
  readonly uiLanguage?: string;
  readonly permissions?: {
    readonly permissions?: readonly string[];
    readonly origins?: readonly string[];
  };
  readonly initialStorage?: Partial<
    Readonly<Record<StorageAreaName, Readonly<Record<string, unknown>>>>
  >;
  readonly initialTabs?: readonly Partial<Tab>[];
}

export interface FakeRuntime {
  id: string;
  lastError: undefined;
  getManifest<T = Record<string, unknown>>(): T;
  getURL(path: string): string;
  sendMessage<T = unknown>(
    message: unknown,
    callback?: (response: T) => void,
  ): Promise<T>;
  connect(connectInfo?: { readonly name?: string }): FakePort;
  readonly onMessage: FakeEvent<
    [
      message: unknown,
      sender: MessageSender,
      sendResponse: SendResponse,
    ]
  >;
  readonly onInstalled: FakeEvent<[details: Record<string, unknown>]>;
  readonly onStartup: FakeEvent<[]>;
  readonly onSuspend: FakeEvent<[]>;
}

export interface FakePort {
  readonly name: string;
  readonly sender?: MessageSender;
  postMessage(message: unknown): void;
  disconnect(): void;
  readonly onMessage: FakeEvent<[message: unknown, port: FakePort]>;
  readonly onDisconnect: FakeEvent<[port: FakePort]>;
}

export interface FakeStorageArea {
  get(callback?: (value: Record<string, unknown>) => void): Promise<Record<string, unknown>>;
  get(
    keys: unknown,
    callback?: (value: Record<string, unknown>) => void,
  ): Promise<Record<string, unknown>>;
  set(
    items: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  remove(
    keys: unknown,
    callback?: () => void,
  ): Promise<void>;
  clear(callback?: () => void): Promise<void>;
  getBytesInUse(
    keys?: unknown,
    callback?: (value: number) => void,
  ): Promise<number>;
}

export interface FakeStorage {
  readonly local: FakeStorageArea;
  readonly sync: FakeStorageArea;
  readonly session: FakeStorageArea;
  readonly managed: FakeStorageArea;
  readonly onChanged: FakeEvent<
    [changes: StorageChanges, areaName: StorageAreaName]
  >;
}

export interface FakeTabs {
  query(
    queryInfo?: Record<string, unknown>,
    callback?: (tabs: Tab[]) => void,
  ): Promise<Tab[]>;
  get(tabId: number, callback?: (tab: Tab) => void): Promise<Tab>;
  create(
    createProperties?: Record<string, unknown>,
    callback?: (tab: Tab) => void,
  ): Promise<Tab>;
  update(
    tabId: number,
    updateProperties: Record<string, unknown>,
    callback?: (tab: Tab) => void,
  ): Promise<Tab>;
  remove(tabIds: number | readonly number[], callback?: () => void): Promise<void>;
  reload(
    tabId?: number,
    reloadProperties?: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  sendMessage<T = unknown>(
    tabId: number,
    message: unknown,
    options?: Record<string, unknown>,
    callback?: (response: T) => void,
  ): Promise<T>;
  readonly onCreated: FakeEvent<[tab: Tab]>;
  readonly onUpdated: FakeEvent<
    [tabId: number, changeInfo: Record<string, unknown>, tab: Tab]
  >;
  readonly onRemoved: FakeEvent<
    [tabId: number, removeInfo: Record<string, unknown>]
  >;
  readonly onActivated: FakeEvent<
    [activeInfo: { readonly tabId: number; readonly windowId: number }]
  >;
}

export interface FakeWindows {
  getCurrent(
    getInfo?: Record<string, unknown>,
    callback?: (window: Window) => void,
  ): Promise<Window>;
  create(
    createData?: Record<string, unknown>,
    callback?: (window: Window) => void,
  ): Promise<Window>;
  update(
    windowId: number,
    updateInfo: Record<string, unknown>,
    callback?: (window: Window) => void,
  ): Promise<Window>;
  remove(windowId: number, callback?: () => void): Promise<void>;
  getAll(
    getInfo?: Record<string, unknown>,
    callback?: (windows: Window[]) => void,
  ): Promise<Window[]>;
}

export interface FakeAction {
  readonly area: 'action';
  setBadgeText(
    details: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  setBadgeBackgroundColor(
    details: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  setTitle(
    details: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  setIcon(
    details: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  openPopup(
    options?: Record<string, unknown>,
    callback?: () => void,
  ): Promise<void>;
  readonly onClicked: FakeEvent<[tab: Tab]>;
  readonly badgeText: string | undefined;
  readonly title: string | undefined;
}

export interface FakeAlarms {
  create(
    infoOrName: Record<string, unknown> | string,
    infoOrCallback?: Record<string, unknown> | (() => void),
    callback?: () => void,
  ): Promise<void>;
  get(
    name?: string,
    callback?: (alarm: Record<string, unknown> | undefined) => void,
  ): Promise<Record<string, unknown> | undefined>;
  getAll(
    callback?: (alarms: Record<string, unknown>[]) => void,
  ): Promise<Record<string, unknown>[]>;
  clear(
    name?: string,
    callback?: (wasCleared: boolean) => void,
  ): Promise<boolean>;
  clearAll(callback?: (wasCleared: boolean) => void): Promise<boolean>;
  readonly onAlarm: FakeEvent<[alarm: Record<string, unknown>]>;
}

export interface FakeI18n {
  getMessage(
    messageName: string,
    substitutions?: string | readonly string[],
  ): string;
  getUILanguage(): string;
  detectLanguage(text: string): Promise<unknown>;
}

export interface FakePermissions {
  contains(
    permissions: Record<string, unknown>,
    callback?: (value: boolean) => void,
  ): Promise<boolean>;
  request(
    permissions: Record<string, unknown>,
    callback?: (value: boolean) => void,
  ): Promise<boolean>;
  remove(
    permissions: Record<string, unknown>,
    callback?: (value: boolean) => void,
  ): Promise<boolean>;
  getAll(
    callback?: (value: Record<string, unknown>) => void,
  ): Promise<Record<string, unknown>>;
  readonly onAdded: FakeEvent<[permissions: Record<string, unknown>]>;
  readonly onRemoved: FakeEvent<[permissions: Record<string, unknown>]>;
}

export interface FakeScripting {
  executeScript<
    Result = unknown,
    Args extends readonly unknown[] = readonly unknown[],
  >(
    injection: ScriptInjection<Args> | readonly ScriptInjection<Args>[],
    callback?: (results: InjectionResult<Result>[]) => void,
  ): Promise<InjectionResult<Result>[]>;
  insertCSS(
    injection: unknown,
    callback?: () => void,
  ): Promise<void>;
  removeCSS(
    injection: unknown,
    callback?: () => void,
  ): Promise<void>;
}

export interface FakeNotifications {
  create(
    options: Record<string, unknown>,
    callback?: (id: string) => void,
  ): Promise<string>;
  update(
    id: string,
    options: Record<string, unknown>,
    callback?: (updated: boolean) => void,
  ): Promise<boolean>;
  clear(
    id: string,
    callback?: (cleared: boolean) => void,
  ): Promise<boolean>;
  getAll(
    callback?: (notifications: Record<string, boolean>) => void,
  ): Promise<Record<string, boolean>>;
  readonly onClicked: FakeEvent<[id: string]>;
  readonly onClosed: FakeEvent<[id: string, byUser: boolean]>;
  readonly onButtonClicked: FakeEvent<[id: string, buttonIndex: number]>;
}

export interface FakeBrowser {
  readonly target: BrowserTarget;
  readonly runtime: FakeRuntime;
  readonly storage: FakeStorage;
  readonly tabs: FakeTabs;
  readonly windows: FakeWindows;
  readonly action: FakeAction;
  readonly alarms: FakeAlarms;
  readonly i18n: FakeI18n;
  readonly permissions: FakePermissions;
  readonly scripting: FakeScripting;
  readonly notifications: FakeNotifications;
  readonly commands: Record<string, unknown>;
  readonly contextMenus: Record<string, unknown>;
  readonly cookies: Record<string, unknown>;
  readonly downloads: Record<string, unknown>;
  readonly sessions: Record<string, unknown>;
  readonly bookmarks: Record<string, unknown>;
  readonly webNavigation: Record<string, unknown>;
  readonly webRequest: Record<string, unknown>;
  reset(): void;
}

interface MutableState {
  storage: Record<StorageAreaName, Map<string, unknown>>;
  tabs: Map<number, Tab>;
  windows: Map<number, Window>;
  currentWindowId: number;
  nextTabId: number;
  nextWindowId: number;
  nextNotificationId: number;
  alarms: Map<string, Record<string, unknown>>;
  permissions: Set<string>;
  origins: Set<string>;
  notifications: Map<string, Record<string, unknown>>;
  badgeText: string | undefined;
  title: string | undefined;
}

export function createFakeEvent<
  Args extends readonly unknown[] = readonly unknown[],
>(): FakeEvent<Args> {
  const listeners = new Set<(...args: Args) => unknown>();

  return {
    addListener(listener) {
      listeners.add(listener);
    },
    removeListener(listener) {
      listeners.delete(listener);
    },
    hasListener(listener) {
      return listeners.has(listener);
    },
    hasListeners() {
      return listeners.size > 0;
    },
    emit(...args) {
      this.dispatch(...args);
    },
    dispatch(...args) {
      return [...listeners].map((listener) => listener(...args));
    },
    clear() {
      listeners.clear();
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

export function createFakeBrowser(
  options: FakeBrowserOptions = {},
): FakeBrowser {
  const target = options.target ?? 'chrome';
  const id = options.id ?? 'fake-extension-id';
  const manifest = {
    manifest_version: 3,
    name: 'Fake extension',
    version: '1.0.0',
    ...(options.messages === undefined
      ? {}
      : {
          default_locale: 'en',
        }),
    ...options.manifest,
  };
  const state: MutableState = {
    storage: {
      local: new Map(),
      sync: new Map(),
      session: new Map(),
      managed: new Map(),
    },
    tabs: new Map(),
    windows: new Map(),
    currentWindowId: 1,
    nextTabId: 1,
    nextWindowId: 2,
    nextNotificationId: 1,
    alarms: new Map(),
    permissions: new Set(options.permissions?.permissions ?? []),
    origins: new Set(options.permissions?.origins ?? []),
    notifications: new Map(),
    badgeText: undefined,
    title: undefined,
  };
  const events: Array<{ clear(): void }> = [];

  const event = <Args extends readonly unknown[]>(): FakeEvent<Args> => {
    const created = createFakeEvent<Args>();
    events.push(created);

    return created;
  };

  for (const [area, values] of Object.entries(options.initialStorage ?? {})) {
    for (const [key, value] of Object.entries(values ?? {})) {
      state.storage[area as StorageAreaName].set(key, value);
    }
  }

  const onMessage = event<
    [
      message: unknown,
      sender: MessageSender,
      sendResponse: SendResponse,
    ]
  >();
  const onInstalled = event<[details: Record<string, unknown>]>();
  const onStartup = event<[]>();
  const onSuspend = event<[]>();
  const storageOnChanged = event<
    [changes: StorageChanges, areaName: StorageAreaName]
  >();
  const onCreated = event<[tab: Tab]>();
  const onUpdated = event<
    [tabId: number, changeInfo: Record<string, unknown>, tab: Tab]
  >();
  const onRemoved = event<
    [tabId: number, removeInfo: Record<string, unknown>]
  >();
  const onActivated = event<
    [activeInfo: { readonly tabId: number; readonly windowId: number }]
  >();
  const actionOnClicked = event<[tab: Tab]>();
  const onAlarm = event<[alarm: Record<string, unknown>]>();
  const permissionsOnAdded = event<[permissions: Record<string, unknown>]>();
  const permissionsOnRemoved = event<
    [permissions: Record<string, unknown>]
  >();
  const notificationsOnClicked = event<[id: string]>();
  const notificationsOnClosed = event<[id: string, byUser: boolean]>();
  const notificationsOnButtonClicked = event<
    [id: string, buttonIndex: number]
  >();
  const commandsOnCommand = event<[command: string]>();
  const contextMenusOnClicked = event<
    [info: Record<string, unknown>, tab?: Tab]
  >();
  const cookiesOnChanged = event<[change: Record<string, unknown>]>();
  const downloadsOnChanged = event<[item: Record<string, unknown>]>();
  const sessionsOnChanged = event<[]>();

  const defaultSender: MessageSender = {
    id,
    url: `chrome-extension://${id}/content.js`,
  };

  const runtime: FakeRuntime = {
    id,
    lastError: undefined,
    getManifest<T = Record<string, unknown>>(): T {
      return manifest as T;
    },
    getURL(path: string): string {
      const prefix =
        target === 'firefox'
          ? `moz-extension://${id}/`
          : `chrome-extension://${id}/`;

      return `${prefix}${path.replace(/^\//, '')}`;
    },
    sendMessage<T = unknown>(...args: unknown[]): Promise<T> {
      const callback = takeCallback(args);
      const response = dispatchMessage(args[0]);

      if (callback !== undefined) {
        void response.then((value) => callback(value as T));
      }

      return response as Promise<T>;
    },
    connect(connectInfo?: { readonly name?: string }): FakePort {
      const portOnMessage = createFakeEvent<
        [message: unknown, port: FakePort]
      >();
      const portOnDisconnect = createFakeEvent<[port: FakePort]>();
      let connected = true;
      const port: FakePort = {
        name: connectInfo?.name ?? '',
        sender: defaultSender,
        postMessage() {},
        disconnect() {
          if (connected) {
            connected = false;
            portOnDisconnect.emit(port);
          }
        },
        onMessage: portOnMessage,
        onDisconnect: portOnDisconnect,
      };

      return port;
    },
    onMessage,
    onInstalled,
    onStartup,
    onSuspend,
  };

  function dispatchMessage(message: unknown): Promise<unknown> {
    return new Promise((resolve) => {
      let settled = false;
      let keepOpen = false;

      const finish = (response?: unknown): void => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(response);
      };

      const results = onMessage.dispatch(
        message,
        defaultSender,
        finish,
      );

      for (const result of results) {
        if (result === true) {
          keepOpen = true;
        }
      }

      if (!keepOpen) {
        queueMicrotask(() => finish(undefined));
      }
    });
  }

  const storage = {
    local: createArea('local'),
    sync: createArea('sync'),
    session: createArea('session'),
    managed: createArea('managed'),
    onChanged: storageOnChanged,
  } satisfies FakeStorage;

  function createArea(area: StorageAreaName): FakeStorageArea {
    const data = state.storage[area];

    return {
      get(...args: unknown[]): Promise<Record<string, unknown>> {
        const callback = takeCallback(args);
        const keys = args[0];
        const value = readStorage(data, keys);
        deliver(callback, value);

        return Promise.resolve(value);
      },
      set(...args: unknown[]): Promise<void> {
        const callback = takeCallback(args);
        const items = args[0] as Record<string, unknown>;
        const changes: StorageChanges = {};

        for (const [key, value] of Object.entries(items)) {
          const change: StorageChange = data.has(key)
            ? { oldValue: data.get(key), newValue: value }
            : { newValue: value };

          changes[key] = change;
          data.set(key, value);
        }

        if (Object.keys(changes).length > 0) {
          storageOnChanged.emit(changes, area);
        }

        deliver(callback, undefined);

        return Promise.resolve();
      },
      remove(...args: unknown[]): Promise<void> {
        const callback = takeCallback(args);
        const keys = args[0];
        const names = normalizeKeys(keys);
        const changes: StorageChanges = {};

        for (const key of names) {
          if (data.has(key)) {
            changes[key] = { oldValue: data.get(key) };
            data.delete(key);
          }
        }

        if (Object.keys(changes).length > 0) {
          storageOnChanged.emit(changes, area);
        }

        deliver(callback, undefined);

        return Promise.resolve();
      },
      clear(...args: unknown[]): Promise<void> {
        const callback = takeCallback(args);
        const changes: StorageChanges = {};

        for (const [key, value] of data) {
          changes[key] = { oldValue: value };
        }

        data.clear();

        if (Object.keys(changes).length > 0) {
          storageOnChanged.emit(changes, area);
        }

        deliver(callback, undefined);

        return Promise.resolve();
      },
      getBytesInUse(...args: unknown[]): Promise<number> {
        const callback = takeCallback(args);
        const bytes = JSON.stringify(Object.fromEntries(data)).length;
        deliver(callback, bytes);

        return Promise.resolve(bytes);
      },
    };
  }

  const tabs: FakeTabs = {
    query(...args: unknown[]): Promise<Tab[]> {
      const callback = takeCallback(args);
      const queryInfo = (args[0] as Record<string, unknown>) ?? {};
      const matches = [...state.tabs.values()].filter((tab) =>
        matchesTab(tab, queryInfo),
      );
      deliver(callback, matches);

      return Promise.resolve(matches);
    },
    get(...args: unknown[]): Promise<Tab> {
      const callback = takeCallback(args);
      const tabId = args[0] as number;
      const tab = requireTab(state, tabId);
      deliver(callback, tab);

      return Promise.resolve(tab);
    },
    create(...args: unknown[]): Promise<Tab> {
      const callback = takeCallback(args);
      const properties = (args[0] as Record<string, unknown>) ?? {};
      const tab = addTab(state, properties);

      if (tab.active) {
        for (const other of state.tabs.values()) {
          if (other.windowId === tab.windowId && other.id !== tab.id) {
            setTabActive(other, false);
          }
        }
        onActivated.emit({ tabId: tab.id as number, windowId: tab.windowId });
      }

      onCreated.emit(tab);
      deliver(callback, tab);

      return Promise.resolve(tab);
    },
    update(...args: unknown[]): Promise<Tab> {
      const callback = takeCallback(args);
      const tabId = args[0] as number;
      const updates = (args[1] as Record<string, unknown>) ?? {};
      const tab = requireTab(state, tabId);
      const updated = { ...tab, ...updates } as Tab;
      state.tabs.set(tabId, updated);

      if (updates.active === true) {
        onActivated.emit({ tabId, windowId: updated.windowId });
      }

      onUpdated.emit(tabId, updates, updated);
      deliver(callback, updated);

      return Promise.resolve(updated);
    },
    remove(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      const tabIds = args[0];
      const ids = Array.isArray(tabIds)
        ? (tabIds as number[])
        : [tabIds as number];

      for (const tabId of ids) {
        if (state.tabs.delete(tabId)) {
          onRemoved.emit(tabId, { windowId: state.currentWindowId });
        }
      }

      deliver(callback, undefined);

      return Promise.resolve();
    },
    reload(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      const tabId =
        typeof args[0] === 'number'
          ? args[0]
          : [...state.tabs.values()].find((tab) => tab.active)?.id;

      if (tabId === undefined) {
        throw new Error('No tab to reload.');
      }

      const tab = requireTab(state, tabId);
      onUpdated.emit(tabId, { status: 'loading' }, tab);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    sendMessage<T = unknown>(...args: unknown[]): Promise<T> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve(undefined as T);
    },
    onCreated,
    onUpdated,
    onRemoved,
    onActivated,
  };

  const windows: FakeWindows = {
    getCurrent(...args: unknown[]): Promise<Window> {
      const callback = takeCallback(args);
      const value = requireWindow(state, state.currentWindowId);
      deliver(callback, value);

      return Promise.resolve(value);
    },
    create(...args: unknown[]): Promise<Window> {
      const callback = takeCallback(args);
      const properties = (args[0] as Record<string, unknown>) ?? {};
      const window: Window = {
        id: state.nextWindowId,
        focused: true,
        type: 'normal',
        state: 'normal',
        ...properties,
      };
      state.nextWindowId += 1;
      state.windows.set(window.id as number, window);
      deliver(callback, window);

      return Promise.resolve(window);
    },
    update(...args: unknown[]): Promise<Window> {
      const callback = takeCallback(args);
      const windowId = args[0] as number;
      const updates = (args[1] as Record<string, unknown>) ?? {};
      const window = {
        ...requireWindow(state, windowId),
        ...updates,
      } as Window;
      state.windows.set(windowId, window);
      deliver(callback, window);

      return Promise.resolve(window);
    },
    remove(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      state.windows.delete(args[0] as number);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    getAll(...args: unknown[]): Promise<Window[]> {
      const callback = takeCallback(args);
      const values = [...state.windows.values()];
      deliver(callback, values);

      return Promise.resolve(values);
    },
  };

  const action: FakeAction = {
    area: 'action',
    setBadgeText(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      state.badgeText = (args[0] as { text?: string }).text;
      deliver(callback, undefined);

      return Promise.resolve();
    },
    setBadgeBackgroundColor(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    setTitle(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      state.title = (args[0] as { title?: string }).title;
      deliver(callback, undefined);

      return Promise.resolve();
    },
    setIcon(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    openPopup(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    onClicked: actionOnClicked,
    get badgeText() {
      return state.badgeText;
    },
    get title() {
      return state.title;
    },
  };

  const alarms: FakeAlarms = {
    create(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      const [nameOrInfo, infoOrCallback] = args;
      const name = typeof nameOrInfo === 'string' ? nameOrInfo : '';
      const info =
        typeof nameOrInfo === 'string'
          ? ((infoOrCallback as Record<string, unknown>) ?? {})
          : ((nameOrInfo as Record<string, unknown>) ?? {});
      const scheduledTime =
        typeof info.when === 'number'
          ? info.when
          : Date.now() + Number(info.delayInMinutes ?? 0) * 60_000;
      state.alarms.set(name, {
        name,
        scheduledTime,
        ...(info.periodInMinutes === undefined
          ? {}
          : { periodInMinutes: info.periodInMinutes }),
      });
      deliver(callback, undefined);

      return Promise.resolve();
    },
    get(...args: unknown[]): Promise<Record<string, unknown> | undefined> {
      const callback = takeCallback(args);
      const value = state.alarms.get((args[0] as string | undefined) ?? '');
      deliver(callback, value);

      return Promise.resolve(value);
    },
    getAll(...args: unknown[]): Promise<Record<string, unknown>[]> {
      const callback = takeCallback(args);
      const values = [...state.alarms.values()];
      deliver(callback, values);

      return Promise.resolve(values);
    },
    clear(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const cleared = state.alarms.delete(
        (args[0] as string | undefined) ?? '',
      );
      deliver(callback, cleared);

      return Promise.resolve(cleared);
    },
    clearAll(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const cleared = state.alarms.size > 0;
      state.alarms.clear();
      deliver(callback, cleared);

      return Promise.resolve(cleared);
    },
    onAlarm,
  };

  const messages = options.messages ?? {};
  const i18n: FakeI18n = {
    getMessage(
      messageName: string,
      substitutions?: string | readonly string[],
    ): string {
      const entry = messages[messageName];
      const message =
        typeof entry === 'string' ? entry : entry?.message ?? '';

      return applySubstitutions(message, substitutions);
    },
    getUILanguage(): string {
      return options.uiLanguage ?? 'en-US';
    },
    detectLanguage(): Promise<unknown> {
      return Promise.resolve({
        isReliable: true,
        languages: [{ language: options.uiLanguage ?? 'en', percentage: 100 }],
      });
    },
  };

  const permissions: FakePermissions = {
    contains(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const value = containsPermissions(
        state,
        args[0] as Record<string, unknown>,
      );
      deliver(callback, value);

      return Promise.resolve(value);
    },
    request(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const requested = args[0] as Record<string, unknown>;
      const added = addPermissions(state, requested);

      if (added.permissions.length > 0 || added.origins.length > 0) {
        permissionsOnAdded.emit(added);
      }

      deliver(callback, true);

      return Promise.resolve(true);
    },
    remove(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const removed = removePermissions(
        state,
        args[0] as Record<string, unknown>,
      );

      if (removed.permissions.length > 0 || removed.origins.length > 0) {
        permissionsOnRemoved.emit(removed);
      }

      deliver(callback, true);

      return Promise.resolve(true);
    },
    getAll(...args: unknown[]): Promise<Record<string, unknown>> {
      const callback = takeCallback(args);
      const value = {
        permissions: [...state.permissions],
        origins: [...state.origins],
      };
      deliver(callback, value);

      return Promise.resolve(value);
    },
    onAdded: permissionsOnAdded,
    onRemoved: permissionsOnRemoved,
  };

  const scripting: FakeScripting = {
    executeScript<Result = unknown, Args extends readonly unknown[] = readonly unknown[]>(
      ...args: unknown[]
    ): Promise<InjectionResult<Result>[]> {
      const callback = takeCallback(args);
      const input = args[0] as
        | ScriptInjection<Args>
        | readonly ScriptInjection<Args>[];
      const injections = Array.isArray(input) ? input : [input];
      const results: InjectionResult<Result>[] = [];

      for (const injection of injections) {
        const frameId = injection.target.frameIds?.[0] ?? 0;

        try {
          const result =
            injection.func === undefined
              ? undefined
              : ((injection.func as (...values: unknown[]) => Result)(
                  ...(injection.args ?? []),
                ) as Result);
          results.push(
            result === undefined
              ? { frameId }
              : { frameId, result },
          );
        } catch (error) {
          results.push({
            frameId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      deliver(callback, results);

      return Promise.resolve(results);
    },
    insertCSS(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    removeCSS(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
  };

  const notifications: FakeNotifications = {
    create(...args: unknown[]): Promise<string> {
      const callback = takeCallback(args);
      const id = `notification-${state.nextNotificationId}`;
      state.nextNotificationId += 1;
      state.notifications.set(id, (args[0] as Record<string, unknown>) ?? {});
      deliver(callback, id);

      return Promise.resolve(id);
    },
    update(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const id = args[0] as string;
      const updated = state.notifications.has(id);

      if (updated) {
        state.notifications.set(id, args[1] as Record<string, unknown>);
      }

      deliver(callback, updated);

      return Promise.resolve(updated);
    },
    clear(...args: unknown[]): Promise<boolean> {
      const callback = takeCallback(args);
      const cleared = state.notifications.delete(args[0] as string);
      deliver(callback, cleared);

      return Promise.resolve(cleared);
    },
    getAll(...args: unknown[]): Promise<Record<string, boolean>> {
      const callback = takeCallback(args);
      const value = Object.fromEntries(
        [...state.notifications.keys()].map((key) => [key, true]),
      );
      deliver(callback, value);

      return Promise.resolve(value);
    },
    onClicked: notificationsOnClicked,
    onClosed: notificationsOnClosed,
    onButtonClicked: notificationsOnButtonClicked,
  };

  const commands = {
    getAll(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    onCommand: commandsOnCommand,
  };

  const contextMenus = {
    create(...args: unknown[]): string {
      const id = (args[0] as { id?: string }).id ?? 'context-menu';
      takeCallback(args);

      return id;
    },
    update(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    remove(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    removeAll(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    onClicked: contextMenusOnClicked,
  };

  const cookies = {
    get(...args: unknown[]): Promise<unknown> {
      const callback = takeCallback(args);
      deliver(callback, null);

      return Promise.resolve(null);
    },
    getAll(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    set(...args: unknown[]): Promise<unknown> {
      const callback = takeCallback(args);
      const value = args[0];
      deliver(callback, value);

      return Promise.resolve(value);
    },
    remove(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    onChanged: cookiesOnChanged,
  };

  const downloads = {
    download(...args: unknown[]): Promise<number> {
      const callback = takeCallback(args);
      const id = state.nextNotificationId;
      state.nextNotificationId += 1;
      deliver(callback, id);

      return Promise.resolve(id);
    },
    cancel(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    search(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    onChanged: downloadsOnChanged,
  };

  const sessions = {
    getRecentlyClosed(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    restore(...args: unknown[]): Promise<unknown> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve(undefined);
    },
    onChanged: sessionsOnChanged,
  };

  const bookmarks = {
    getTree(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    search(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    get(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    getSubTree(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    getChildren(...args: unknown[]): Promise<unknown[]> {
      const callback = takeCallback(args);
      deliver(callback, []);

      return Promise.resolve([]);
    },
    create(...args: unknown[]): Promise<unknown> {
      const callback = takeCallback(args);
      const value = args[0];
      deliver(callback, value);

      return Promise.resolve(value);
    },
    move(...args: unknown[]): Promise<unknown> {
      const callback = takeCallback(args);
      const value = args[0];
      deliver(callback, value);

      return Promise.resolve(value);
    },
    update(...args: unknown[]): Promise<unknown> {
      const callback = takeCallback(args);
      const value = args[0];
      deliver(callback, value);

      return Promise.resolve(value);
    },
    remove(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    removeTree(...args: unknown[]): Promise<void> {
      const callback = takeCallback(args);
      deliver(callback, undefined);

      return Promise.resolve();
    },
    onCreated: event<[id: string, bookmark: unknown]>(),
    onRemoved: event<[id: string, removeInfo: unknown]>(),
    onChanged: event<[id: string, changeInfo: unknown]>(),
    onMoved: event<[id: string, moveInfo: unknown]>(),
  };

  const webNavigation = {
    onBeforeNavigate: event<[details: Record<string, unknown>]>(),
    onCommitted: event<[details: Record<string, unknown>]>(),
    onDOMContentLoaded: event<[details: Record<string, unknown>]>(),
    onCompleted: event<[details: Record<string, unknown>]>(),
    onErrorOccurred: event<[details: Record<string, unknown>]>(),
    onCreatedNavigationTarget: event<[details: Record<string, unknown>]>(),
    onReferenceFragmentUpdated: event<[details: Record<string, unknown>]>(),
    onHistoryStateUpdated: event<[details: Record<string, unknown>]>(),
  };

  const webRequest = {
    onBeforeRequest: event<[details: Record<string, unknown>]>(),
    onBeforeSendHeaders: event<[details: Record<string, unknown>]>(),
    onSendHeaders: event<[details: Record<string, unknown>]>(),
    onHeadersReceived: event<[details: Record<string, unknown>]>(),
    onResponseStarted: event<[details: Record<string, unknown>]>(),
    onCompleted: event<[details: Record<string, unknown>]>(),
    onErrorOccurred: event<[details: Record<string, unknown>]>(),
  };

  if (state.windows.size === 0) {
    state.windows.set(state.currentWindowId, {
      id: state.currentWindowId,
      focused: true,
      type: 'normal',
      state: 'normal',
    });
  }

  for (const tab of options.initialTabs ?? []) {
    addTab(state, tab as Record<string, unknown>);
  }

  const fake: FakeBrowser = {
    target,
    runtime,
    storage,
    tabs,
    windows,
    action,
    alarms,
    i18n,
    permissions,
    scripting,
    notifications,
    commands,
    contextMenus,
    cookies,
    downloads,
    sessions,
    bookmarks,
    webNavigation,
    webRequest,
    reset(): void {
      for (const area of Object.values(state.storage)) {
        area.clear();
      }

      state.tabs.clear();
      state.windows.clear();
      state.windows.set(state.currentWindowId, {
        id: state.currentWindowId,
        focused: true,
        type: 'normal',
        state: 'normal',
      });
      state.nextTabId = 1;
      state.nextWindowId = 2;
      state.nextNotificationId = 1;
      state.alarms.clear();
      state.permissions.clear();
      state.origins.clear();
      state.notifications.clear();
      state.badgeText = undefined;
      state.title = undefined;

      for (const created of events) {
        created.clear();
      }
    },
  };

  return fake;
}

export const fakeBrowser: FakeBrowser = /*#__PURE__*/ createFakeBrowser();

let installedFakeBrowser: FakeBrowser | undefined;

export function resetFakeBrowser(): void {
  (installedFakeBrowser ?? fakeBrowser).reset();
}

export function installFakeBrowser(
  options: FakeBrowserOptions & {
    readonly scope?: unknown;
  } = {},
): FakeBrowser {
  const scope = (options.scope ?? globalThis) as Record<string, unknown>;
  const fake =
    Object.keys(options).length === 0
      ? fakeBrowser
      : createFakeBrowser(options);
  const target = options.target ?? fake.target;

  if (target === 'firefox') {
    scope.browser = fake;
    delete scope.chrome;
  } else {
    scope.chrome = fake;
    scope.browser = fake;
  }

  installedFakeBrowser = fake;
  clearAdapterCache();

  return fake;
}

export function uninstallFakeBrowser(
  scope: unknown = globalThis,
): void {
  const value = scope as Record<string, unknown>;
  delete value.browser;
  delete value.chrome;
  installedFakeBrowser = undefined;
  clearAdapterCache();
}

function readStorage(
  data: Map<string, unknown>,
  keys: unknown,
): Record<string, unknown> {
  if (keys === undefined || keys === null || typeof keys === 'function') {
    return Object.fromEntries(data);
  }

  if (typeof keys === 'string') {
    return data.has(keys) ? { [keys]: data.get(keys) } : {};
  }

  if (Array.isArray(keys)) {
    return Object.fromEntries(
      keys
        .filter((key): key is string => typeof key === 'string')
        .filter((key) => data.has(key))
        .map((key) => [key, data.get(key)]),
    );
  }

  if (typeof keys === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, fallback] of Object.entries(keys)) {
      result[key] = data.has(key) ? data.get(key) : fallback;
    }

    return result;
  }

  return {};
}

function normalizeKeys(keys: unknown): string[] {
  if (keys === undefined || keys === null) {
    return [];
  }

  return Array.isArray(keys)
    ? keys.filter((key): key is string => typeof key === 'string')
    : typeof keys === 'string'
      ? [keys]
      : [];
}

function takeCallback(args: unknown[]): ((value?: unknown) => void) | undefined {
  const last = args[args.length - 1];

  if (typeof last === 'function') {
    args.pop();

    return last as (value?: unknown) => void;
  }

  return undefined;
}

function deliver(
  callback: ((value?: unknown) => void) | undefined,
  value: unknown,
): void {
  if (callback !== undefined) {
    queueMicrotask(() => callback(value));
  }
}

function matchesTab(tab: Tab, query: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(query)) {
    if (
      value === undefined ||
      key === 'currentWindow' ||
      key === 'lastFocusedWindow' ||
      key === 'windowType' ||
      key === 'populate'
    ) {
      continue;
    }

    if (key === 'url') {
      const urls = Array.isArray(value) ? value : [value];

      if (!urls.some((url) => matchesPattern(String(url), tab.url ?? ''))) {
        return false;
      }

      continue;
    }

    if (tab[key] !== value) {
      return false;
    }
  }

  return true;
}

function matchesPattern(pattern: string, value: string): boolean {
  if (pattern === value || pattern === '<all_urls>' || pattern === '*://*/*') {
    return true;
  }

  const expression = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '.*');

  return new RegExp(`^${expression}$`).test(value);
}

function addTab(
  state: MutableState,
  properties: Record<string, unknown>,
): Tab {
  const id =
    typeof properties.id === 'number' ? properties.id : state.nextTabId;
  state.nextTabId = Math.max(state.nextTabId, id + 1);
  const windowId =
    typeof properties.windowId === 'number'
      ? properties.windowId
      : state.currentWindowId;
  const index =
    typeof properties.index === 'number'
      ? properties.index
      : [...state.tabs.values()].filter((tab) => tab.windowId === windowId)
          .length;
  const tab: Tab = {
    id,
    index,
    windowId,
    active: properties.active === true,
    highlighted: properties.highlighted === true,
    pinned: properties.pinned === true,
    incognito: properties.incognito === true,
    ...properties,
  };
  state.tabs.set(id, tab);

  return tab;
}

function setTabActive(tab: Tab, active: boolean): void {
  const mutable = tab as { active: boolean };
  mutable.active = active;
}

function requireTab(state: MutableState, tabId: number): Tab {
  const tab = state.tabs.get(tabId);

  if (tab === undefined) {
    throw new Error(`No tab with id ${tabId}.`);
  }

  return tab;
}

function requireWindow(state: MutableState, windowId: number): Window {
  const window = state.windows.get(windowId);

  if (window === undefined) {
    throw new Error(`No window with id ${windowId}.`);
  }

  return window;
}

function containsPermissions(
  state: MutableState,
  requested: Record<string, unknown>,
): boolean {
  const permissions = requested.permissions ?? [];
  const origins = requested.origins ?? [];

  return (
    (Array.isArray(permissions) &&
      permissions.every((permission) =>
        state.permissions.has(String(permission)),
      )) &&
    (Array.isArray(origins) &&
      origins.every((origin) => state.origins.has(String(origin))))
  );
}

function addPermissions(
  state: MutableState,
  requested: Record<string, unknown>,
): { permissions: string[]; origins: string[] } {
  const permissions: string[] = [];
  const origins: string[] = [];

  for (const permission of toArray(requested.permissions)) {
    if (!state.permissions.has(permission)) {
      state.permissions.add(permission);
      permissions.push(permission);
    }
  }

  for (const origin of toArray(requested.origins)) {
    if (!state.origins.has(origin)) {
      state.origins.add(origin);
      origins.push(origin);
    }
  }

  return { permissions, origins };
}

function removePermissions(
  state: MutableState,
  requested: Record<string, unknown>,
): { permissions: string[]; origins: string[] } {
  const permissions = toArray(requested.permissions).filter((permission) =>
    state.permissions.delete(permission),
  );
  const origins = toArray(requested.origins).filter((origin) =>
    state.origins.delete(origin),
  );

  return { permissions, origins };
}

function toArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item))
    : [];
}

function applySubstitutions(
  message: string,
  substitutions: string | readonly string[] | undefined,
): string {
  if (substitutions === undefined) {
    return message;
  }

  const values =
    typeof substitutions === 'string' ? [substitutions] : substitutions;

  return values.reduce(
    (result, value, index) => result.replaceAll(`$${index + 1}`, value),
    message,
  );
}

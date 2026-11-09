import { createActionApi } from './action/index.ts';
import { createAlarmsApi } from './alarms/index.ts';
import { createBookmarksApi } from './bookmarks/index.ts';
import { createCommandsApi } from './commands/index.ts';
import { createContextMenusApi } from './context-menus/index.ts';
import { createCookiesApi } from './cookies/index.ts';
import { createDownloadsApi } from './downloads/index.ts';
import { createI18nApi } from './i18n/index.ts';
import { createNotificationsApi } from './notifications/index.ts';
import { createPermissionsApi } from './permissions/index.ts';
import { createRuntimeApi } from './runtime/index.ts';
import { createScriptingApi } from './scripting/index.ts';
import { createSessionsApi } from './sessions/index.ts';
import { createStorageApi } from './storage/index.ts';
import { createTabsApi } from './tabs/index.ts';
import { createWebNavigationApi } from './web-navigation/index.ts';
import { createWebRequestApi } from './web-request/index.ts';
import { createWindowsApi } from './windows/index.ts';
import { resolveAdapter } from '../browser/resolve.ts';
import { createLazyAdapter } from './lazy-adapter.ts';

const adapter = createLazyAdapter(resolveAdapter);

export const runtime = /*#__PURE__*/ createRuntimeApi(adapter);
export const storage = /*#__PURE__*/ createStorageApi(adapter);
export const tabs = /*#__PURE__*/ createTabsApi(adapter);
export const windows = /*#__PURE__*/ createWindowsApi(adapter);
export const action = /*#__PURE__*/ createActionApi(adapter);
export const alarms = /*#__PURE__*/ createAlarmsApi(adapter);
export const commands = /*#__PURE__*/ createCommandsApi(adapter);
export const contextMenus = /*#__PURE__*/ createContextMenusApi(adapter);
export const cookies = /*#__PURE__*/ createCookiesApi(adapter);
export const downloads = /*#__PURE__*/ createDownloadsApi(adapter);
export const i18n = /*#__PURE__*/ createI18nApi(adapter);
export const notifications = /*#__PURE__*/ createNotificationsApi(adapter);
export const permissions = /*#__PURE__*/ createPermissionsApi(adapter);
export const scripting = /*#__PURE__*/ createScriptingApi(adapter);
export const sessions = /*#__PURE__*/ createSessionsApi(adapter);
export const webNavigation = /*#__PURE__*/ createWebNavigationApi(adapter);
export const webRequest = /*#__PURE__*/ createWebRequestApi(adapter);
export const bookmarks = /*#__PURE__*/ createBookmarksApi(adapter);

export const browser = {
  runtime,
  storage,
  tabs,
  windows,
  action,
  alarms,
  bookmarks,
  commands,
  contextMenus,
  cookies,
  downloads,
  notifications,
  permissions,
  scripting,
  sessions,
  webNavigation,
  webRequest,
  i18n,
} as const;

export type Browser = typeof browser;

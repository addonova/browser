import { createChromiumAdapter } from '../adapters/chromium/index.ts';
import type { BrowserAdapter } from '../adapters/types.ts';
import { createActionApi } from '../api/action/index.ts';
import { createAlarmsApi } from '../api/alarms/index.ts';
import { createBookmarksApi } from '../api/bookmarks/index.ts';
import { createCommandsApi } from '../api/commands/index.ts';
import { createContextMenusApi } from '../api/context-menus/index.ts';
import { createCookiesApi } from '../api/cookies/index.ts';
import { createDownloadsApi } from '../api/downloads/index.ts';
import { createI18nApi } from '../api/i18n/index.ts';
import { createLazyAdapter } from '../api/lazy-adapter.ts';
import type { AdapterProvider } from '../api/lazy-adapter.ts';
import { createNotificationsApi } from '../api/notifications/index.ts';
import { createPermissionsApi } from '../api/permissions/index.ts';
import { createRuntimeApi } from '../api/runtime/index.ts';
import { createScriptingApi } from '../api/scripting/index.ts';
import { createSessionsApi } from '../api/sessions/index.ts';
import { createStorageApi } from '../api/storage/index.ts';
import { createTabsApi } from '../api/tabs/index.ts';
import { createWebNavigationApi } from '../api/web-navigation/index.ts';
import { createWebRequestApi } from '../api/web-request/index.ts';
import { createWindowsApi } from '../api/windows/index.ts';
import { detectBrowser } from '../browser/detect.ts';
import { readManifestVersion } from '../browser/info-core.ts';
import type { BrowserInfo, BrowserInfoOptions } from '../browser/info.ts';
import type {
  ApiAvailability,
  CapabilityQuery,
} from '../shared/capabilities.ts';
import {
  createFixedBrowserInfo,
  getFixedBrowserInfo,
} from './info.ts';
import {
  availabilityWith,
  isSupportedWith,
  supportsWith,
} from './support.ts';
import {
  createInjectScript,
  createMessagingFactory,
  createProxyServices,
} from './utilities.ts';

let cached: BrowserAdapter | null | undefined;

const provider: AdapterProvider = () => {
  if (cached !== undefined) {
    return cached;
  }

  const detection = detectBrowser({ resolveName: false });

  cached =
    detection.api === null
      ? null
      : createChromiumAdapter({
          target: 'chromium',
          api: detection.api,
          manifestVersion: readManifestVersion(detection.api),
          callbackBased: detection.callbackBased,
        });

  return cached;
};

const adapter = createLazyAdapter(provider);

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

export const browserInfo: BrowserInfo = createFixedBrowserInfo('chromium');

export function getBrowserInfo(
  options: Omit<BrowserInfoOptions, 'target'> = {},
): BrowserInfo {
  return getFixedBrowserInfo('chromium', options);
}

export function supports(
  api: string | CapabilityQuery,
  _options: unknown = {},
): boolean {
  return supportsWith(provider, api);
}

export function getAvailability(
  api: string | CapabilityQuery,
): ApiAvailability {
  return availabilityWith(provider, api);
}

export function isBrowserSupported(): boolean {
  return isSupportedWith(provider);
}

export const defineExtensionMessaging = /*#__PURE__*/ createMessagingFactory(runtime);
export const defineProxyService = /*#__PURE__*/ createProxyServices(
  defineExtensionMessaging,
);
export const injectScript = /*#__PURE__*/ createInjectScript({
  scripting,
  tabs,
});

export * from './shared-exports.ts';
export type * from '../types/index.ts';

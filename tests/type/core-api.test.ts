import { expect, it } from '@guchho/test';

import type {
  ActionApi,
  ActionArea,
  AlarmsApi,
  BookmarksApi,
  Browser,
  CommandsApi,
  ContextMenusApi,
  CookiesApi,
  DownloadsApi,
  I18nApi,
  Manifest,
  NotificationsApi,
  PermissionsApi,
  RuntimeApi,
  ScriptingApi,
  SessionsApi,
  StorageApi,
  StorageArea,
  Tab,
  TabsApi,
  WebNavigationApi,
  WebRequestApi,
  Window,
  WindowsApi,
} from '../../src/index.ts';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;

type Expect<Value extends true> = Value;

declare const runtimeApi: RuntimeApi;

type ManifestResult = ReturnType<
  typeof runtimeApi.getManifest<Manifest>
>;

type CoreSurface = [
  Expect<Equal<ManifestResult, Manifest>>,
  Expect<Equal<ReturnType<RuntimeApi['sendMessage']>, Promise<unknown>>>,
  Expect<Equal<StorageApi['local'], StorageArea>>,
  Expect<
    Equal<ReturnType<StorageApi['getBytesInUse']>, Promise<number>>
  >,
  Expect<Equal<ReturnType<TabsApi['query']>, Promise<Tab[]>>>,
  Expect<Equal<ReturnType<TabsApi['sendMessage']>, Promise<unknown>>>,
  Expect<Equal<ReturnType<WindowsApi['getCurrent']>, Promise<Window>>>,
  Expect<Equal<ActionApi['area'], ActionArea | null>>,
  Expect<
    Equal<
      ReturnType<PermissionsApi['contains']>,
      Promise<boolean>
    >
  >,
  Expect<Equal<Browser['runtime'], RuntimeApi>>,
  Expect<Equal<Browser['storage'], StorageApi>>,
  Expect<Equal<Browser['tabs'], TabsApi>>,
  Expect<Equal<Browser['windows'], WindowsApi>>,
  Expect<Equal<Browser['action'], ActionApi>>,
  Expect<Equal<Browser['permissions'], PermissionsApi>>,
  Expect<Equal<Browser['alarms'], AlarmsApi>>,
  Expect<Equal<Browser['bookmarks'], BookmarksApi>>,
  Expect<Equal<Browser['commands'], CommandsApi>>,
  Expect<Equal<Browser['contextMenus'], ContextMenusApi>>,
  Expect<Equal<Browser['cookies'], CookiesApi>>,
  Expect<Equal<Browser['downloads'], DownloadsApi>>,
  Expect<Equal<Browser['i18n'], I18nApi>>,
  Expect<Equal<Browser['notifications'], NotificationsApi>>,
  Expect<Equal<Browser['scripting'], ScriptingApi>>,
  Expect<Equal<Browser['sessions'], SessionsApi>>,
  Expect<Equal<Browser['webNavigation'], WebNavigationApi>>,
  Expect<Equal<Browser['webRequest'], WebRequestApi>>,
  Expect<
    Equal<
      Extract<
        keyof WebRequestApi,
        | 'handlerBehaviorChanged'
        | 'filterResponseData'
        | 'getSecurityInfo'
      >,
      never
    >
  >,
  Expect<
    Equal<
      Extract<
        keyof TabsApi,
        'executeScript' | 'insertCSS' | 'removeCSS'
      >,
      never
    >
  >,
];

it('exposes the typed core API surface', () => {
  const surface: CoreSurface = [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ];

  expect(surface.every(Boolean)).toBe(true);
});

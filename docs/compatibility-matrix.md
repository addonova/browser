# Compatibility Matrix

Status: Phase 6 verified baseline for `@addonova/browser` `0.1.0`.

Verification date: 2026-11-09.

Scope: the API surface implemented by this package. A row describes what the
library delegates to, not every API exposed by every browser. The library never
emulates a missing native API and never grants permissions automatically.

## Legend

- **Yes**: the native API is present for that browser and manifest version; the
  library delegates to it. Required permissions may still make a call fail.
- **Cond**: native support depends on browser version, manifest mode, runtime
  state, permission, or a documented constraint. The library exposes the
  method; callers must feature-detect or handle a typed failure.
- **No**: the native API is absent for that browser/manifest version. The
  library access fails with `BROWSER_UNSUPPORTED_API`.
- **N/A**: that browser/manifest combination is outside the current support
  scope, or no longer loadable in current stable releases.
- **Omitted**: intentionally not part of the library surface, even where the
  native API exists.

Current stable Chrome and Chromium no longer load general-purpose MV2
extensions, so their legacy MV2 columns are `N/A`. Chrome disabled MV2 on all
channels with Chrome 138, removed the enterprise policy in Chrome 139, and
removed the remaining MV2 extensions from the Chrome Web Store on 2026-08-31.
Older browser versions may still run some MV2 code, but that combination is
not tested or supported. Edge MV2 is still in a deprecation transition as of
the verification date, so the Edge legacy MV2 column is `Cond`, not removed.
Firefox continues to support MV2 and MV3.

## MV3 matrix

| Library surface | Chrome MV3 | Chromium MV3 | Edge MV3 | Firefox MV3 |
| --- | --- | --- | --- | --- |
| `runtime.id`, `getManifest`, `getURL`, `sendMessage`, `connect` | Yes | Yes | Yes | Yes |
| `runtime.onMessage`, `onInstalled`, `onStartup` | Yes | Yes | Yes | Yes |
| `runtime.onSuspend` | Yes | Yes | Yes | Yes (Firefox 100+; fires with event pages from 106) |
| `storage.local`, `storage.sync`, area `get`/`set`/`remove`/`clear` | Yes | Yes | Yes | Yes |
| `storage.session`, area `get`/`set`/`remove`/`clear` | Cond (Chrome 102+) | Cond | Cond | Cond (Firefox 115+) |
| `storage.managed` `get` | Cond (policy-provisioned) | Cond | Cond | Cond (policy-provisioned; no schema enforcement) |
| `storage.managed` `set`/`remove`/`clear` | Cond (read-only; writes fail) | Cond | Cond | Cond (read-only; writes fail) |
| `storage.*.getBytesInUse` | Yes | Yes | Yes | Cond (area/version-dependent) |
| `storage.onChanged` | Yes | Yes | Yes | Yes |
| `tabs.query`, `get`, `create`, `update`, `remove`, `reload`, `sendMessage` | Yes | Yes | Yes | Yes |
| `tabs.onCreated`, `onUpdated`, `onRemoved`, `onActivated` | Yes | Yes | Yes | Yes |
| `tabs.executeScript`, `tabs.insertCSS`, `tabs.removeCSS` | Omitted | Omitted | Omitted | Omitted |
| `windows.getCurrent`, `create`, `update`, `remove`, `getAll` | Yes | Yes | Yes | Yes |
| `action.setBadgeText`, `setBadgeBackgroundColor`, `setTitle`, `setIcon`, `onClicked` | Yes | Yes | Yes | Yes (Firefox 109+) |
| `action.openPopup` | Cond (Chrome 127+) | Cond | Cond | Cond (109+; user gesture before 149) |
| `alarms.create`, `get`, `getAll`, `clear`, `clearAll`, `onAlarm` | Yes | Yes | Yes | Yes |
| `commands.getAll`, `onCommand` | Yes | Yes | Yes | Yes |
| `contextMenus.create`, `update`, `remove`, `removeAll`, `onClicked` | Yes | Yes | Yes | Yes |
| `notifications.create`, `clear`, `getAll`, `onClicked`, `onClosed` | Yes | Yes | Yes | Yes |
| `notifications.update` | Yes | Yes | Yes | No |
| `notifications.onButtonClicked` | Yes | Yes | Yes | No |
| `permissions.contains`, `getAll`, `remove`, `onAdded`, `onRemoved` | Yes | Yes | Yes | Yes |
| `permissions.request` | Cond (user gesture) | Cond | Cond | Cond (user gesture) |
| `scripting.executeScript`, `insertCSS`, `removeCSS` | Yes | Yes | Yes | Yes |
| `bookmarks.getTree`, `search`, `get`, `create`, `update`, `remove`, `removeTree` | Yes | Yes | Yes | Yes |
| `bookmarks.onCreated`, `onRemoved`, `onChanged`, `onMoved` | Yes | Yes | Yes | Yes |
| `cookies.get`, `getAll`, `set`, `remove`, `onChanged` | Yes | Yes | Yes | Yes |
| `downloads.download`, `cancel`, `search`, `onChanged` | Yes | Yes | Yes | Yes |
| `sessions.getRecentlyClosed`, `restore`, `onChanged` | Yes | Yes | Yes | Yes |
| `webNavigation` event passthrough | Yes | Yes | Yes | Yes |
| `webRequest` event passthrough | Cond (observational; no blocking) | Cond | Cond | Yes (blocking native support is not surfaced) |
| `webRequest` blocking helpers | Omitted | Omitted | Omitted | Omitted |
| `i18n.getMessage`, `getUILanguage`, `detectLanguage` | Yes | Yes | Yes | Yes |

## Legacy MV2 matrix

| Library surface | Chrome legacy MV2 | Chromium legacy MV2 | Edge legacy MV2 | Firefox MV2 |
| --- | --- | --- | --- | --- |
| `runtime` methods/events | N/A | N/A | Cond | Yes |
| `runtime.onSuspend` | N/A | N/A | Cond | Yes (100+; event pages from 106) |
| `storage` areas and `onChanged` | N/A | N/A | Cond | Yes |
| `storage.session` | N/A | N/A | Cond | Cond (Firefox 115+) |
| `storage.*.getBytesInUse` | N/A | N/A | Cond | Cond (area/version-dependent) |
| `tabs` methods/events | N/A | N/A | Cond | Yes |
| `tabs.executeScript`, `insertCSS`, `removeCSS` | N/A | N/A | Cond (native, but omitted) | Cond (native, but omitted) |
| `windows` methods | N/A | N/A | Cond | Yes |
| `action` methods/`onClicked` | N/A | N/A | Cond (via `browserAction`/`pageAction`) | Yes (via `browserAction`/`pageAction`) |
| `action.openPopup` | N/A | N/A | Cond | Cond (57+; user gesture before 149) |
| `alarms`, `commands`, `contextMenus` | N/A | N/A | Cond | Yes |
| `notifications` core methods/events | N/A | N/A | Cond | Yes |
| `notifications.update`, `onButtonClicked` | N/A | N/A | Cond | No |
| `permissions` methods/events | N/A | N/A | Cond | Yes |
| `permissions.request` | N/A | N/A | Cond | Cond (user gesture) |
| `scripting.executeScript`, `insertCSS`, `removeCSS` | N/A | N/A | No | Cond (Firefox 102+) |
| `bookmarks`, `cookies`, `downloads`, `sessions`, `webNavigation` | N/A | N/A | Cond | Yes |
| `webRequest` event passthrough | N/A | N/A | Cond | Yes |
| `webRequest` blocking helpers | N/A | N/A | Cond (native, but omitted) | Cond (native, but omitted) |
| `i18n` | N/A | N/A | Cond | Yes |

## Module notes

### Runtime

- `runtime.onSuspend` exists in Chromium and Firefox. In Firefox it was added in
  Firefox 100 but does not fire until Firefox 106, when event pages are
  available. It is not a portable shutdown hook; do not rely on it for critical
  persistence.
- Firefox `getManifest()` may return `null` for missing values and may omit
  unsupported keys. Treat the manifest as browser-shaped structural data.
- Callback-based Chromium methods are wrapped in Promises. Firefox methods stay
  native-Promise based.

### Storage

- `storage.session` is documented for Chrome MV3 (Chrome 102+) and is available
  in Firefox 115+. It is not a general Chromium MV2 facility.
- `storage.managed` is read-only in practice. The library exposes the same
  `StorageArea` shape, but native writes are rejected.
- Firefox `getBytesInUse()` support is area/version-dependent: `sync` from 78,
  `session` from 131, and `local`/`managed` from 144. Callers must handle a
  typed unsupported/permission failure.
- Firefox does not support `storage.managed` schema enforcement or an
  area-specific `onChanged`; the library's top-level `storage.onChanged` is the
  portable event.

### Action

- MV3 uses `action`; MV2 prefers `browserAction`, then `action`, then
  `pageAction`. `ActionApi.area` exposes the resolved native namespace or
  `null`.
- Firefox MV3 `action` is available from Firefox 109. Firefox MV2 uses
  `browserAction`/`pageAction`.
- `openPopup()` is version-gated in Chromium (Chrome 127+) and requires a user
  gesture in Firefox before Firefox 149. The library does not synthesize a
  popup when `openPopup` is missing.

### Notifications

- Firefox does not provide `notifications.update()` or
  `notifications.onButtonClicked`; these calls fail with
  `BROWSER_UNSUPPORTED_API`.
- Firefox supports only the `basic` notification type in practice. The
  structural `NotificationOptions` type accepts more, but the browser may
  ignore unsupported fields.

### Scripting and tabs

- `scripting.executeScript`, `insertCSS`, and `removeCSS` are exposed through
  the native `scripting` namespace. Chromium MV3 and Firefox MV3 support it.
- Firefox 102+ also exposes `browser.scripting` in MV2, so this module can work
  in Firefox MV2. Chrome/Edge/Chromium MV2 do not have `scripting`.
- `tabs.executeScript`, `tabs.insertCSS`, and `tabs.removeCSS` are intentionally
  not exposed or emulated. There is no automatic `tabs.executeScript` fallback.
  MV2 callers must use the native `scripting` API where available, or raw
  browser APIs outside this package.
- Manifest-declared content scripts are not generated or injected by this
  library. It only calls `scripting` when the caller asks it to.

### WebRequest

- Only event passthrough is exposed: `onBeforeRequest`, `onBeforeSendHeaders`,
  `onSendHeaders`, `onHeadersReceived`, `onResponseStarted`, `onCompleted`, and
  `onErrorOccurred`.
- Blocking APIs (`handlerBehaviorChanged`, `filterResponseData`,
  `getSecurityInfo`) and blocking return values are intentionally omitted.
- Chromium MV3 `webRequest` is observational; `webRequestBlocking` is not
  available to most extensions. Firefox MV3 supports blocking natively, but
  this package does not surface it. Use `declarativeNetRequest` on Chromium
  when blocking is required.

### Permissions

- `permissions.request()` is not a grant: it asks the user. It requires a user
  gesture and optional permissions declared in the manifest. A request can
  return `false` or reject.
- No module requests or grants permissions on import or construction.

### Tabs, Windows, Cookies, Sessions, and Downloads

- `tabs` access to sensitive fields such as `url`, `title`, and `favIconUrl`
  requires the `tabs` permission or host access.
- `windows` may need `tabs` to populate tab details.
- Cookie partition keys are Chromium-oriented. Firefox container/private
  browsing behavior differs.
- Firefox sessions may omit `url`, `title`, and `favIconUrl` from recently
  closed tab entries.
- Download item fields are a structural subset; use native docs for
  browser-specific fields.

### I18n

- `_locales` data is required for `getMessage()`.
- `getMessage()` and `getUILanguage()` are synchronous; `detectLanguage()` is
  asynchronous.

## Manifest guidance

The library does not generate or modify manifests. These are the shapes the
supported targets expect.

### MV3

- Chrome, Chromium, and Edge background: `background.service_worker`.
- Firefox MV3 background: `background.scripts` (event pages). Firefox does not
  support `background.service_worker`.
- Action key: `action` for Chrome, Chromium, Edge, and Firefox MV3.
- Host access: `host_permissions` for required hosts,
  `optional_host_permissions` for runtime-requested hosts, and `activeTab` for
  user-initiated temporary access.
- Register event listeners at the top level of the service worker or event
  page. Do not register them after asynchronous initialization.
- Firefox MV3 can use `browser_specific_settings.gecko`; Chromium targets may
  use `minimum_chrome_version`.

### MV2

- Firefox MV2 uses `browser_action` or `page_action`, not `action`.
- Firefox MV2 background: `background.scripts` or `background.page`, with
  `persistent: false` for event pages where supported.
- Host permissions belong in `permissions` in MV2.
- `scripting` is available in Firefox MV2 (102+) but not in Chrome, Chromium,
  or Edge MV2.
- `tabs.executeScript` exists natively in MV2 but is intentionally omitted
  from this package.
- `browser_specific_settings.gecko.id` is required for a stable Firefox add-on
  ID. Chrome/Chromium legacy MV2 remains outside current support scope.
- Edge MV2 remains in a deprecation transition. As of the verification date,
  Microsoft documents warnings and staged disablement, with enterprise
  deprecation in early 2027; do not treat Edge MV2 as a long-term target.

## Permission mapping

| Module | Manifest requirement |
| --- | --- |
| `runtime` | None for the exposed methods |
| `storage` | `storage` |
| `tabs` | `tabs` for sensitive fields; host permissions for page access |
| `windows` | Usually none; `tabs` to populate tab details |
| `action` | `action` key in MV3; `browser_action`/`page_action` in MV2 |
| `alarms` | `alarms` |
| `commands` | `commands` manifest key |
| `contextMenus` | `contextMenus` |
| `notifications` | `notifications` |
| `permissions` | Optional permissions must be declared |
| `scripting` | `scripting` plus host permissions or `activeTab` |
| `bookmarks` | `bookmarks` |
| `cookies` | `cookies` plus host permissions |
| `downloads` | `downloads` |
| `sessions` | `sessions` |
| `webNavigation` | `webNavigation` |
| `webRequest` | `webRequest` plus host permissions |
| `i18n` | None at runtime; `_locales` resources |

Permissions are never auto-granted. Static host permissions are granted at
install time subject to browser policy; optional permissions require
`permissions.request()` from an allowed user gesture.

## Verification sources

Data was cross-checked against MDN browser-compat-data and the official
browser documentation on 2026-11-09:

- MDN browser-compat-data, `webextensions/api/*` and
  `webextensions/manifest/*`:
  `https://github.com/mdn/browser-compat-data`
- MDN `scripting`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting`
- MDN `storage.session`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session`
- MDN `action.openPopup`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/action/openPopup`
- MDN `notifications.onButtonClicked`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications/onButtonClicked`
- MDN `runtime.onSuspend`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onSuspend`
- MDN `tabs.executeScript`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript`
- MDN `webRequest`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest`
- MDN manifest `background`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background`
- MDN manifest `permissions`: `https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions`
- Chrome MV2 deprecation timeline: `https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline`
- Chrome blocking web requests: `https://developer.chrome.com/docs/extensions/develop/migrate/blocking-web-requests`
- Chrome `storage`: `https://developer.chrome.com/docs/extensions/reference/api/storage`
- Chrome `action`: `https://developer.chrome.com/docs/extensions/reference/api/action`
- Edge MV3 migration guidance: `https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/manifest-v3`
- Edge MV2 deprecation announcement: `https://blogs.windows.com/msedgedev/2026/08/07/moving-the-microsoft-edge-extensions-ecosystem-forward-with-manifest-version-3/`

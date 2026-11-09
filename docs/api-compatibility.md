# API Compatibility and Permissions

Status: implementation baseline for `@addonova/browser` `0.1.0`.

The verified namespace/method matrix, manifest guidance, and source list are in
[`compatibility-matrix.md`](./compatibility-matrix.md). It was checked against
MDN browser-compat-data and official browser documentation on 2026-11-09.

Legend: supported · conditional · unavailable

| Module | Chromium MV3 (Chrome/Chromium/Edge) | Firefox | Permissions / notes |
| --- | --- | --- | --- |
| `runtime` | supported | supported | Core extension API; no extra permission. `onSuspend` exists in both engines but has different lifecycle timing. |
| `storage` | supported | supported | `storage` permission. `session` (Chrome 102+ MV3, Firefox 115+) and `managed` are availability-checked. `managed` is read-only; Firefox `getBytesInUse` is area/version-dependent. |
| `tabs` | supported | supported | `tabs` for sensitive fields; host permissions for page access. MV2 `executeScript`/`insertCSS`/`removeCSS` are intentionally omitted. |
| `windows` | supported | supported | `tabs` may be needed to populate tab details. |
| `action` | supported | supported | MV3 `action`; MV2 `browserAction`/`pageAction`. `openPopup` is version- and gesture-gated. |
| `alarms` | supported | supported | `alarms` permission. |
| `commands` | supported | supported | `commands` manifest key. |
| `contextMenus` | supported | supported | `contextMenus` permission. `create()` is synchronous and returns the menu id. |
| `notifications` | supported | conditional | `notifications` permission. Firefox lacks `update()` and `onButtonClicked`; only basic notifications are portable. |
| `bookmarks` | supported | supported | `bookmarks` permission. Node fields vary by browser. |
| `cookies` | supported | supported | `cookies` plus host permissions. Partitioned-cookie fields are Chromium-oriented. |
| `downloads` | supported | supported | `downloads` permission. `DownloadItem` is a structural subset. |
| `scripting` | supported in MV3; unavailable in Chromium MV2 | supported in MV2 (102+) and MV3 | `scripting` plus host permissions or `activeTab`. No `tabs.executeScript` emulation. |
| `sessions` | supported | supported | `sessions` permission. Firefox recently closed entries may omit URL/title/favIconUrl. |
| `webNavigation` | supported | supported | `webNavigation` permission. Event passthrough only. |
| `webRequest` | conditional in MV3; unavailable in Chromium MV2 | conditional | `webRequest` plus host permissions. Event passthrough only; blocking helpers are omitted. Chromium MV3 is observational. |
| `i18n` | supported | supported | Uses `_locales`; no runtime permission. |

## Manifest-version scope

- Chrome and Chromium legacy MV2 are outside current support scope: stable
  releases no longer load general MV2 extensions. Edge legacy MV2 is still in
  a deprecation transition and is conditional. Firefox supports both MV2 and
  MV3.
- MV3 Chromium targets use `background.service_worker`; Firefox MV3 uses
  `background.scripts` event pages. MV2 Firefox uses `browser_action` or
  `page_action`.
- Host permissions move from `permissions` in MV2 to `host_permissions` /
  `optional_host_permissions` in MV3. `activeTab` grants temporary access from
  a user gesture.
- The library does not generate or modify manifests, and it does not inject
  manifest-declared content scripts.

## Explicit failure behavior

- Missing namespaces or methods throw `BrowserApiError` with
  `BROWSER_UNSUPPORTED_API`.
- Missing extension environments throw `BROWSER_UNSUPPORTED_ENVIRONMENT`.
- Native permission failures keep `BROWSER_PERMISSION_DENIED`.
- Other native failures are normalized to `BROWSER_API_FAILED`.
- No module requests permissions or grants capabilities automatically.
  `permissions.request()` asks the user and may return `false` or reject.

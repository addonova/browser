[![Addonova Browser Social Banner](https://raw.githubusercontent.com/addonova/.github/refs/heads/main/profile/image/addonova_browser_banner.png)](https://github.com/addonova)

<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/@addonova/browser"><img src="https://img.shields.io/npm/v/@addonova/browser?labelColor=%23153c26&color=%23ccff00" alt="Version"></a>
    <a href="https://nodejs.org/en/about/previous-releases"><img src="https://img.shields.io/node/v/@addonova/browser?labelColor=%23153c26&color=%23ccff00" alt="node compatibility"></a>
    <a href="https://raw.githubusercontent.com/addonova/browser/refs/heads/main/LICENSE"><img src="https://img.shields.io/github/license/addonova/browser?labelColor=%23153c26&color=%23ccff00" alt="License"></a>
    <a href="https://github.com/addonova/browser/issues"><img src="https://img.shields.io/github/issues/addonova/browser?labelColor=%23153c26&color=%23ccff00" alt="Issues"></a>
    <a href="https://github.com/addonova/browser/graphs/contributors"><img src="https://img.shields.io/github/contributors/addonova/browser?labelColor=%23153c26&color=%23ccff00" alt="Contributors"></a>
    <a href="https://github.com/sponsors/code-hemu"><img src="https://img.shields.io/badge/Sponsor-GitHub-red?labelColor=%23153c26&color=%23ccff00" alt="Sponsor"></a>
  </p>
</div>

Browser extension APIs are similar but not identical. `@addonova/browser`
normalizes the differences that can be normalized safely:

- one Promise-based method shape for asynchronous APIs;
- unchanged native events with `addListener`, `removeListener`, and
  `hasListener`;
- typed errors for missing APIs, missing permissions, and native failures;
- support for `chrome`, `chromium`, `edge`, and `firefox` targets;
- browser-specific entry points for build-time code elimination.

The package does not generate manifests, inject content scripts, grant
permissions, or emulate an API the browser does not provide. See the verified
[compatibility matrix](docs/compatibility-matrix.md) for the exact support
surface.

## Installation

```sh
npm install @addonova/browser
```

Requirements:

- ESM bundler or extension runtime with ES module support.
- Node.js `>=20` for development and the Guchho-based test tooling.
- No runtime dependency on Addonova Build.

Package entries:

| Import | Purpose |
| --- | --- |
| `@addonova/browser` | Runtime browser detection; default fallback. |
| `@addonova/browser/chrome` | Fixed Chrome target. |
| `@addonova/browser/chromium` | Fixed Chromium target. |
| `@addonova/browser/edge` | Fixed Edge target. |
| `@addonova/browser/firefox` | Fixed Firefox target. |

## Quick start

```ts
import { action, storage, tabs } from '@addonova/browser';

export async function updateBadge(): Promise<void> {
  const [tab] = await tabs.query({ active: true, currentWindow: true });

  if (tab?.id === undefined) {
    return;
  }

  const { enabled = false } = await storage.local.get('enabled');

  await tabs.sendMessage(tab.id, {
    type: 'set-enabled',
    enabled,
  });
  await action.setBadgeText({ text: enabled ? 'ON' : '' });
}
```

Register listeners at the top level of a service worker or event page:

```ts
import { runtime } from '@addonova/browser';

runtime.onInstalled.addListener((details) => {
  console.log('Installed/updated:', details.reason);
});
```

## Runtime utilities

### Typed storage

Use `storage.defineItem()` to keep a value typed, provide a fallback or lazy
initializer, and run versioned migrations:

```ts
import { storage } from '@addonova/browser';

interface Settings {
  theme: 'light' | 'dark';
  compact: boolean;
}

const settings = storage.defineItem<Settings>('settings', {
  area: 'local',
  fallback: { theme: 'light', compact: false },
  version: 2,
  migrations: {
    2(value) {
      return { compact: false, ...(value as Partial<Settings>) };
    },
  },
});

const current = await settings.getValue();
await settings.setValue({ ...current, theme: 'dark' });

const stop = settings.watch((newValue, oldValue) => {
  console.log('settings changed', oldValue, newValue);
});
stop();
```

`getMeta()` and `setMeta()` expose the stored item version. `removeValue()`
deletes the value; the next read falls back or initializes again.

### Type-safe messaging

Define a message protocol once and share it between the sender and receiver:

```ts
import { defineExtensionMessaging } from '@addonova/browser';

interface Protocol {
  ping(data: { at: number }): { at: number };
  add(a: number, b: number): number;
}

const messaging = defineExtensionMessaging<Protocol>();

// Background or any context with a listener.
messaging.onMessage('ping', ({ data, sender }) => {
  console.log('ping from', sender.id, data.at);

  return { at: Date.now() };
});

// Any extension context.
const response = await messaging.sendMessage('ping', { at: Date.now() });
```

Errors thrown by a handler are serialized and rethrown on the sender. Use
`defineProxyService()` when the service has many methods:

```ts
import { defineProxyService } from '@addonova/browser';

const [registerCounter, getCounter] = defineProxyService(
  'counter',
  () => {
    let value = 0;

    return {
      add(amount: number) {
        value += amount;
        return value;
      },
      read() {
        return value;
      },
    };
  },
);

registerCounter();
const counter = getCounter();

await counter.add(2);
await counter.read();
registerCounter.dispose();
```

### Content scripts

`createContentScriptContext()` tracks timers, animation frames, and listeners
and invalidates them together when the content script is unloaded:

```ts
import {
  createContentScriptContext,
  injectScript,
} from '@addonova/browser';

const ctx = createContentScriptContext();

ctx.setTimeout(() => {
  console.log('still valid:', ctx.isValid);
}, 1000);

ctx.addEventListener(document, 'click', () => {
  console.log('clicked');
});

ctx.onInvalidated(() => {
  console.log('content script invalidated');
});

await injectScript('/injected.js', { allFrames: false });
```

Add `validateRuntime: false` when a test environment does not expose
`runtime.id`.

### Content-script UI

Mount UI into the page, a shadow root, or an iframe:

```ts
import {
  createIntegratedUi,
  createShadowRootUi,
} from '@addonova/browser';

const inline = createIntegratedUi(ctx, {
  anchor: '#app',
  append: 'last',
  onMount(container) {
    const button = document.createElement('button');
    button.textContent = 'Addonova';
    container.append(button);

    return button;
  },
});

await inline.mount();
inline.remove();

const panel = createShadowRootUi(ctx, {
  anchor: 'body',
  position: 'overlay',
  alignment: 'bottom-right',
  css: ':host { all: initial; } .panel { font: 14px sans-serif; }',
  onMount(container) {
    const element = document.createElement('div');
    element.className = 'panel';
    element.textContent = 'Shadow UI';
    container.append(element);

    return element;
  },
});

await panel.mount();
panel.autoMount();
```

UI helpers support `anchor` selectors or elements, `append` modes
(`first`, `last`, `before`, `after`, `replace`), `position`
(`inline`, `overlay`, `modal`), `alignment`, `zIndex`, and `onRemove`.
`autoMount()` mounts when the anchor appears, remounts when it is removed, and
stops on context invalidation.

### i18n

```ts
import { createI18nHelper, formatMessage, t } from '@addonova/browser';

const i18nHelper = createI18nHelper({ fallbackToKey: true });

i18nHelper.locale;
i18nHelper.t('greeting', 'Ada');
i18nHelper.raw('greeting', 'Ada');

t('items_selected', ['3']);
formatMessage('Selected $1 item(s)', '3');
```

`t()` falls back to the message name when the browser returns an empty string.

## Testing

### Fake browser

`@addonova/browser/testing` provides an in-memory implementation of the runtime
API. It records storage, tabs, permissions, notifications, alarms, and events,
and routes `runtime.sendMessage()` through `onMessage` listeners.

```ts
import {
  createFakeBrowser,
  installFakeBrowser,
  resetFakeBrowser,
  uninstallFakeBrowser,
} from '@addonova/browser/testing';

const fake = installFakeBrowser({ target: 'chrome' });

await fake.storage.local.set({ enabled: true });
fake.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  sendResponse({ ok: true });
  return true;
});

resetFakeBrowser();
uninstallFakeBrowser();
```

Use `createFakeBrowser()` for isolated instances and `fakeBrowser` for the
shared default. `reset()` clears state while keeping listeners.

### Guchho Test setup

Register the setup file so the fake browser is installed before each test:

```ts
// guchho.test.config.ts
import { defineConfig } from '@guchho/test';

export default defineConfig({
  setupFiles: ['@addonova/browser/testing/setup'],
});
```

The setup entry installs the fake browser before the suite, resets it before
each test, and uninstalls it afterwards. `@guchho/test` remains an optional peer
dependency.

### End-to-end tests

See [`docs/playwright-e2e.md`](docs/playwright-e2e.md) for a Playwright guide
that loads the built extension into a persistent Chromium context.

## Browser compatibility

The verified matrix is in
[`docs/compatibility-matrix.md`](docs/compatibility-matrix.md). The short
version:

- Chrome, Chromium, and Edge share one Chromium adapter. Current stable
  releases target Manifest V3; legacy MV2 is outside current support scope.
- Edge legacy MV2 is still in Microsoft's deprecation transition and is
  conditional.
- Firefox supports both MV2 and MV3. Firefox MV3 uses `background.scripts`
  event pages, not a service worker.
- Firefox 102+ exposes `scripting` in MV2; Chromium MV2 does not.
- `tabs.executeScript` and blocking `webRequest` APIs are intentionally not
  exposed. Use `scripting` and observational `webRequest` events instead.
- Firefox does not support `notifications.update()` or
  `notifications.onButtonClicked`.

Run `supports()` before using an optional API when an extension must work across
older browser versions.

## API reference

The root export exposes a `browser` object plus named namespaces:

```ts
import {
  action,
  alarms,
  bookmarks,
  browser,
  browserInfo,
  commands,
  contextMenus,
  cookies,
  downloads,
  getAvailability,
  getBrowserInfo,
  i18n,
  isBrowserSupported,
  notifications,
  permissions,
  runtime,
  scripting,
  sessions,
  storage,
  supports,
  tabs,
  webNavigation,
  webRequest,
  windows,
  BrowserApiError,
} from '@addonova/browser';
```

| Namespace | Representative methods |
| --- | --- |
| `runtime` | `id`, `getManifest`, `getURL`, `sendMessage`, `connect`, events |
| `storage` | `local`, `sync`, `session`, `managed`, `isAreaAvailable` |
| `tabs` | `query`, `get`, `create`, `update`, `remove`, `reload`, `sendMessage` |
| `windows` | `getCurrent`, `create`, `update`, `remove`, `getAll` |
| `action` | badge text/color, title, icon, `openPopup`, `onClicked` |
| `alarms` | `create`, `get`, `getAll`, `clear`, `clearAll`, `onAlarm` |
| `commands` | `getAll`, `onCommand` |
| `contextMenus` | `create`, `update`, `remove`, `removeAll`, `onClicked` |
| `notifications` | `create`, `update`, `clear`, `getAll`, events |
| `permissions` | `contains`, `request`, `remove`, `getAll`, events |
| `scripting` | `executeScript`, `insertCSS`, `removeCSS` |
| `bookmarks` | `getTree`, `search`, CRUD, events |
| `cookies` | `get`, `getAll`, `set`, `remove`, `onChanged` |
| `downloads` | `download`, `cancel`, `search`, `onChanged` |
| `sessions` | `getRecentlyClosed`, `restore`, `onChanged` |
| `webNavigation` | navigation event passthrough |
| `webRequest` | observational request event passthrough |
| `i18n` | `getMessage`, `getUILanguage`, `detectLanguage` |

Shared exports:

- `browserInfo`: lazily resolved browser metadata.
- `getBrowserInfo()`: resolves the browser name, version, engine, and manifest
  version.
- `supports('namespace.method')`: boolean feature check.
- `getAvailability('namespace.method')`: typed availability result with a
  reason.
- `isBrowserSupported()`: whether an extension runtime is available.
- `BrowserApiError`: normalized error class with a `code`.
- `callbackToPromise`, `promisifyMethod`, and event helpers for advanced
  integrations.

## TypeScript examples

All public types are exported from the package root.

```ts
import {
  BrowserApiError,
  runtime,
  storage,
  type StorageChange,
} from '@addonova/browser';

interface Settings {
  enabled: boolean;
  theme: 'light' | 'dark';
}

export async function readSettings(): Promise<Settings> {
  const values = await storage.local.get(['enabled', 'theme']);

  return {
    enabled: values.enabled === true,
    theme: values.theme === 'dark' ? 'dark' : 'light',
  };
}

storage.onChanged.addListener(
  (changes: Record<string, StorageChange>, areaName) => {
    if (areaName !== 'local' || changes.enabled === undefined) {
      return;
    }

    console.log('enabled changed:', changes.enabled.newValue);
  },
);

export async function sendHello(): Promise<void> {
  try {
    await runtime.sendMessage({ type: 'hello' });
  } catch (error) {
    if (error instanceof BrowserApiError) {
      console.error(error.code, error.api, error.message);
    }
  }
}
```

## Browser detection

```ts
import { browserInfo, getBrowserInfo } from '@addonova/browser';

console.log(browserInfo.name); // 'chrome' | 'chromium' | 'edge' | 'firefox' | 'unknown'
console.log(browserInfo.engine); // 'chromium' | 'gecko' | 'unknown'

const info = getBrowserInfo();
console.log(info);
```

Detection is feature-first: it checks the extension runtime and API shape before
parsing the user agent. Outside an extension, the package returns an unknown
environment instead of throwing at import time.

## 8. Feature detection

```ts
import { getAvailability, storage, supports } from '@addonova/browser';

if (supports('scripting.executeScript')) {
  // The native API is present.
}

const availability = getAvailability('storage.session');
console.log(availability.available, availability.reason);

if (storage.isAreaAvailable('session')) {
  await storage.session.set({ draft: 'saved for this browser session' });
}
```

`supports()` is a fast capability check. `getAvailability()` explains why a
capability is unavailable. Accessing a missing method or event throws
`BrowserApiError` with `BROWSER_UNSUPPORTED_API`.

## 9. Browser-specific adapters

Use the root import for runtime detection, or a fixed subpath when the target is
known at build time:

```ts
import { tabs } from '@addonova/browser/chrome';
```

Chrome, Chromium, and Edge share the Chromium adapter implementation. Firefox
uses a separate Gecko adapter with native Promises. All entries expose the same
public surface. Application code should normally import the root; the build
integration chooses the subpath.

## Browser-specific tree shaking

Use static imports so a bundler can remove unused APIs:

```ts
import { tabs } from '@addonova/browser';

const [tab] = await tabs.query({ active: true, currentWindow: true });
```

Aliasing the root to a browser subpath also removes unrelated adapters:

```js
// Vite-style alias
resolve: {
  alias: {
    '@addonova/browser': '@addonova/browser/chrome',
  },
}
```

The repository verifies real generated bundles with Guchho in
`tests/build/tree-shaking.test.ts`. A Chrome build retains Chrome plus shared
Chromium code, a Firefox build retains Firefox code, and an Edge build retains
Edge plus shared Chromium code. Importing only `tabs` removes unrelated API
modules. Dynamic access through the `browser` object intentionally retains every
API. See [`docs/build-integration.md`](docs/build-integration.md).

## Build-time API selection

The optional compile-time definition `__ADDONOVA_BROWSER__` accepts `'chrome'`,
`'chromium'`, `'firefox'`, `'edge'`, or `'auto'`:

```js
define: {
  __ADDONOVA_BROWSER__: '"chrome"',
}
```

It makes target-dependent runtime behavior deterministic. It does not replace
the subpath alias for code elimination. Invalid or missing values fall back to
`'auto'`.

## Runtime resolution

The default root import resolves the adapter on first use and memoizes it:

1. Read the build-time target, if present.
2. Detect the extension runtime and browser API shape.
3. Select Chrome, Chromium, Edge, or Firefox.
4. Fall back to an unknown environment that reports explicit unsupported errors.

Runtime resolution always remains available. It does not require Addonova Build,
a define, or an alias. Fixed subpaths skip detection and use their target
provider directly.

## Manifest compatibility

The library does not create or edit `manifest.json`.

Manifest V3:

```json
{
  "manifest_version": 3,
  "background": { "service_worker": "background.js", "type": "module" },
  "action": { "default_popup": "popup.html" },
  "permissions": ["storage", "tabs"],
  "host_permissions": ["https://example.com/*"]
}
```

For Firefox MV3, use an event page instead of a service worker:

```json
{
  "manifest_version": 3,
  "background": { "scripts": ["background.js"] },
  "action": { "default_popup": "popup.html" },
  "browser_specific_settings": {
    "gecko": { "id": "example@addonova.dev" }
  }
}
```

Manifest V2 for Firefox uses `browser_action` or `page_action`, host
permissions inside `permissions`, and background scripts or a background page.
Chromium legacy MV2 is outside current support scope; Edge MV2 is conditional.
See the [compatibility matrix](docs/compatibility-matrix.md) for background
shapes, `webRequestBlocking`, `scripting`, and host-permission differences.

Register event listeners synchronously at the top level of a service worker or
event page. Do not wait for asynchronous initialization before registering
listeners.

## Error handling

```ts
import { BrowserApiError, runtime } from '@addonova/browser';

try {
  await runtime.sendMessage({ type: 'ping' });
} catch (error) {
  if (error instanceof BrowserApiError) {
    switch (error.code) {
      case 'BROWSER_UNSUPPORTED_API':
      case 'BROWSER_UNSUPPORTED_ENVIRONMENT':
      case 'BROWSER_PERMISSION_DENIED':
      case 'BROWSER_API_FAILED':
        console.error(error.code, error.api, error.message);
        break;
    }
  }
}
```

Error codes:

| Code | Meaning |
| --- | --- |
| `BROWSER_UNSUPPORTED_API` | Namespace, method, or event is unavailable. |
| `BROWSER_UNSUPPORTED_ENVIRONMENT` | No extension runtime was detected. |
| `BROWSER_PERMISSION_DENIED` | The browser reported a permission failure. |
| `BROWSER_API_FAILED` | A native API failed for another reason. |

No module fakes success, silently no-ops, or falls back to an unrequested API.

## Permissions

Permissions are never requested or granted automatically. Declare static
permissions in the manifest and request optional permissions from a permitted
user gesture:

```ts
import { permissions } from '@addonova/browser';

const granted = await permissions.request({
  permissions: ['bookmarks'],
});

if (!granted) {
  console.warn('Bookmarks permission was not granted.');
}
```

Module permission mapping:

| Module | Requirement |
| --- | --- |
| `storage` | `storage` |
| `tabs` | `tabs` for sensitive fields; host permissions for page access |
| `alarms` | `alarms` |
| `contextMenus` | `contextMenus` |
| `notifications` | `notifications` |
| `bookmarks` | `bookmarks` |
| `cookies` | `cookies` plus host permissions |
| `downloads` | `downloads` |
| `sessions` | `sessions` |
| `webNavigation` | `webNavigation` |
| `webRequest` | `webRequest` plus host permissions |
| `scripting` | `scripting` plus host permissions or `activeTab` |
| `runtime`, `action`, `commands`, `i18n` | No extra runtime permission |

Static host permissions are granted at install time subject to browser policy.
`permissions.request()` asks the user; it can return `false` or reject. See
[`docs/api-compatibility.md`](docs/api-compatibility.md) and the
[compatibility matrix](docs/compatibility-matrix.md).

Packaging and manual browser smoke-test steps are in
[`docs/integration-testing.md`](docs/integration-testing.md).

Do not publish to npm without explicit authorization. Security issues should be
reported according to [`SECURITY`](https://github.com/addonova/.github/blob/main/.github/SECURITY.md).

## License

Addonova is licensed under **MIT**. Copyright © [CodeHemu](https://github.com/code-hemu).

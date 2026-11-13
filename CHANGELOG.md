# Changelog

All notable changes to `@addonova/browser` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-13

### Added

- Typed storage items through `storage.defineItem()`, with fallbacks, lazy
  initialization, versioned migrations, metadata, and change watchers.
- Type-safe extension messaging with `defineExtensionMessaging()` and
  `defineProxyService()` for exposing async services across extension contexts.
- Content-script helpers: `createContentScriptContext()`, `injectScript()`, and
  auto-invalidating timers, animation frames, and event listeners.
- Content-script UI helpers: `createIntegratedUi()`, `createShadowRootUi()`,
  `createIframeUi()`, and `autoMount()`.
- i18n helpers: `createI18nHelper()`, `formatMessage()`, `i18nHelper`, and `t`.
- An in-memory fake browser API with events, storage, tabs, permissions,
  scripting, i18n, and notifications.
- A Guchho Test setup entry point: `@addonova/browser/testing/setup`.
- Pure factories `createExtensionMessaging()`, `createProxyServices()`, and
  `createInjectScript()` for custom runtimes, with tree-shakeable bound
  utilities in every browser entry point.
- A Playwright end-to-end testing guide.

## [0.1.0]

### Added

- Initial public package structure for Chrome, Chromium, Edge, and Firefox.
- Runtime, storage, tabs, windows, action, alarms, commands, context menus,
  notifications, permissions, scripting, bookmarks, cookies, downloads,
  sessions, web navigation, web request, and i18n namespaces.
- Runtime browser detection, feature detection, typed errors, and native event
  passthrough.
- Browser-specific entry points for Chrome, Chromium, Edge, and Firefox.
- Build-time target selection and verified tree-shaking tests using Guchho.
- Compatibility matrix, build-integration guide, examples, and package
  documentation.

### Notes

- Chrome and Chromium legacy MV2 are outside current support scope. Edge legacy
  MV2 is conditional. Firefox supports MV2 and MV3.
- Blocking `webRequest` helpers and `tabs.executeScript` are intentionally not
  exposed.
- Publishing requires explicit maintainer authorization.

# Changelog

All notable changes to `@addonova/browser` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

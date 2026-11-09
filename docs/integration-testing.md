# Integration Testing

Automated checks cover the package API, build-time selection, WXT integration,
and package contents. Real-browser smoke tests are manual because they require
browser binaries and a profile with unpacked-extension support.

## Automated checks

Run from the repository root:

```sh
npm run typecheck
npm run build
npm test
npm run build:examples
```

Build the WXT example separately:

```sh
cd examples/wxt
npm install
npm run build:chrome
npm run build:firefox
```

Expected WXT artifacts:

- `.output/chrome-mv3`
- `.output/firefox-mv2`

Validate the publishable package:

```sh
npm pack
npx publint ./addonova-browser-0.1.0.tgz
npx @arethetypeswrong/cli ./addonova-browser-0.1.0.tgz --profile esm-only
```

The package is ESM-only. The `node16-cjs` and `node10` resolutions are ignored
by the `esm-only` profile; `node16` from ESM and bundler resolution must pass.

## Manual browser matrix

| Browser | Artifact | Manifest | Status |
| --- | --- | --- | --- |
| Chrome | `examples/chrome/dist` | MV3 service worker | Documented, not run here |
| Chromium | Use the root entry or `@addonova/browser/chromium` | MV3 service worker | Documented, not run here |
| Edge | `examples/edge/dist` | MV3 service worker | Documented, not run here |
| Firefox | `examples/firefox/dist` | MV3 event page | Documented, not run here |
| Firefox MV2 | `examples/wxt/.output/firefox-mv2` | MV2 background script | Documented, not run here |
| Chrome WXT | `examples/wxt/.output/chrome-mv3` | MV3 service worker | Documented, not run here |

## Smoke-test procedure

For each applicable artifact:

1. Load the artifact as an unpacked extension.
2. Open the extension's service worker or background console and confirm there
   are no import, adapter, or permission errors.
3. Confirm the action badge changes to `ON`.
4. Click the toolbar action and confirm the badge count increments.
5. Inspect extension storage and confirm `installedReason`, `installedAt`, and
   `clicks` are written. Edge and Firefox examples also write `browser` and
   `engine`.
6. In Firefox, confirm the background console logs `Click count changed:` after
   a click.
7. Reload the extension and confirm storage values persist.
8. Restart the browser and confirm the event listener is registered again.

## Expected differences

- Chrome, Chromium, and Edge examples use MV3 service workers.
- Firefox MV3 uses `background.scripts` and an event page.
- Firefox MV2 is provided by the WXT example.
- `browserInfo.name` reflects the fixed build target in the targeted examples;
  the root entry reports the detected runtime target.
- Permissions are declared in the manifests and are never granted
  automatically by the library.

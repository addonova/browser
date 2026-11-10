# Build Integration and Tree Shaking

`@addonova/browser` has two independent selection mechanisms:

1. **Runtime resolution (default).** Import `@addonova/browser` and the package
   detects the extension environment on first use.
2. **Build-time selection (optional).** Alias the package root to a
   browser-specific subpath so only that adapter is reachable by the bundler.
   API-level tree shaking then removes unused API modules.

Neither mechanism requires Addonova Build, and the package has no runtime
dependencies.

## Entry surfaces

| Import | Behavior |
| --- | --- |
| `@addonova/browser` | Runtime adapter resolution for Chrome, Chromium, Firefox, and Edge. |
| `@addonova/browser/chrome` | Fixed Chrome target; shares the Chromium adapter implementation. |
| `@addonova/browser/chromium` | Fixed Chromium target. |
| `@addonova/browser/edge` | Fixed Edge target; shares the Chromium adapter implementation. |
| `@addonova/browser/firefox` | Fixed Firefox target. |

All five entries expose the same public API: the `browser` object, every named
namespace, `browserInfo`, `getBrowserInfo`, `supports`, `getAvailability`,
`isBrowserSupported`, shared error/Promise/event helpers, and public types.

The subpaths are intended for build tools. Application code should normally
continue to import from `@addonova/browser`; the build integration performs the
alias.

## Alias contract

Map the **package root** to the chosen subpath:

```text
@addonova/browser  ->  @addonova/browser/chrome
```

Do not also import browser subpaths directly when the root is aliased.

### Guchho (verified)

```js
import { build } from 'guchho';

await build({
  entrypoints: ['src/background.ts'],
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  bundle: true,
  splitting: false,
  treeShaking: true,
  metafile: true,
  alias: {
    '@addonova/browser': '@addonova/browser/chrome',
  },
});
```

Guchho emits one format per build. If the alias value is not resolved by your
project layout, pass the resolved path to
`node_modules/@addonova/browser/dist/entries/chrome.js` instead. Call
`stop()` before deleting output files on Windows.

### esbuild

```js
await esbuild.build({
  entryPoints: ['src/background.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  alias: {
    '@addonova/browser': '@addonova/browser/chrome',
  },
  metafile: true,
});
```

### Rollup

```js
import alias from '@rollup/plugin-alias';

export default {
  plugins: [
    alias({
      entries: [
        {
          find: '@addonova/browser',
          replacement: '@addonova/browser/chrome',
        },
      ],
    }),
  ],
};
```

### Vite

```js
export default {
  resolve: {
    alias: {
      '@addonova/browser': '@addonova/browser/chrome',
    },
  },
};
```

## Compile-time definition

The optional global definition `__ADDONOVA_BROWSER__` accepts the string
expressions `'chrome'`, `'chromium'`, `'firefox'`, `'edge'`, or `'auto'`:

```js
define: {
  __ADDONOVA_BROWSER__: '"chrome"',
}
```

It makes `browserInfo`, `getBrowserInfo`, `supports`, and the runtime adapter
resolver prefer the named target. Invalid, missing, or unreadable values fall
back to `auto`.

The definition does **not** replace the alias for code elimination. Use it to
make target-dependent runtime behavior deterministic; use the subpath alias to
exclude other adapter implementations from the bundle.

## What is preserved and removed

Verified against generated Guchho bundles in `tests/build/tree-shaking.test.ts`:

- Chrome keeps `chrome` + shared `chromium`, removes Firefox and Edge.
- Firefox keeps only `firefox`, removes Chrome, Chromium, and Edge.
- Edge keeps `edge` + shared `chromium`, removes Chrome and Firefox.
- Importing only `tabs` removes storage, bookmarks, downloads, notifications,
  and cookies.
- Importing `tabs` and `storage` keeps both and still removes unused modules.
- Importing the `browser` object and indexing it dynamically keeps every API.
- Event listener registration survives bundling.
- Minified output preserves the selected implementation.
- The runtime fallback keeps all adapters and still executes.

## Addonova handoff

Addonova should implement build-time selection purely as bundler configuration:

- Map `--browser chrome|chromium|firefox|edge` to the matching subpath alias.
- Set `__ADDONOVA_BROWSER__` to the same target when a definition is useful.
- Keep `@addonova/browser` external when the host extension build intentionally
  resolves the package at runtime; aliasing and externalization are mutually
  exclusive.
- Do not add source-level imports of browser subpaths to application code.
- No changes are required in `@addonova/browser` for the current Addonova
  externalization behavior.

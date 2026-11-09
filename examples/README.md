# Examples

These examples use the local package source.

## Chrome, Edge, and Firefox

Build the package first, then bundle all three vanilla examples:

```sh
npm run build:examples
```

Outputs:

- `examples/chrome/dist`
- `examples/edge/dist`
- `examples/firefox/dist`

Load the relevant `dist` directory as an unpacked extension. Each example uses
a fixed browser entry through the build alias, so unused adapters are removed
from that bundle.

## WXT

```sh
cd examples/wxt
npm install
npm run build:chrome
npm run build:firefox
```

WXT writes to `.output/`. The config aliases `@addonova/browser` to the matching
subpath using `env.browser` from WXT. This is verified with WXT 0.21.5: Chrome
builds to `.output/chrome-mv3` and Firefox builds to `.output/firefox-mv2`.

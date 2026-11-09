# Contributing

Thanks for improving `@addonova/browser`.

## Development setup

Requirements:

- Node.js `>=20`.
- npm.

```sh
npm install
npm run typecheck
npm run build
npm test
```

Guchho `1.0.9` installs a platform-native binary with a `postinstall` script.
The repository already sets the required `allowScripts` entry and `.npmrc`
`include=optional` setting.

## Guidelines

- Keep the package ESM-only and free of runtime dependencies.
- Do not add Node.js APIs to shipped code.
- Preserve the zero-side-effect import contract and tree-shakeable module
  boundaries.
- Keep synchronous browser methods synchronous.
- Prefer native `browser.*` Promises on Firefox; wrap callback APIs only when
  required.
- Do not emulate unsupported browser APIs or grant permissions silently.
- Add unit and type tests with every public API change.
- Update the compatibility matrix and permission mapping when browser behavior
  changes.

## Verification before a pull request

```sh
npm run typecheck
npm run build
npm test
```

Also run `npm pack --dry-run` when changing package metadata or exported files.

## Commit style

Use a concise, imperative commit message. Keep changes focused. Do not commit
generated output, local reference copies, or secrets.

## Publishing

Do not publish to npm or create a release without explicit maintainer
authorization.

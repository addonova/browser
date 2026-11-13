# Playwright end-to-end guide

Playwright can load an unpacked extension into a persistent Chromium context.
This guide uses the Addonova build output and the helpers from
`@addonova/browser`.

## Prerequisites

- Node.js 20 or newer.
- Playwright with Chromium installed: `npx playwright install chromium`.
- A built extension. Run `addonova build` and use `dist/chrome`.
- `@addonova/browser` installed in the extension project.

Playwright's extension support is Chromium-only. Firefox and Edge extension
loading is not covered by the standard Playwright persistent context and is
still verified manually with the procedure in
[`integration-testing.md`](integration-testing.md).

## Configuration

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    trace: 'retain-on-failure',
  },
});
```

Run the build before the suite so the extension directory always exists:

```json
{
  "scripts": {
    "build:test": "addonova build",
    "e2e": "npm run build:test && playwright test"
  }
}
```

## Loading the extension

```ts
// e2e/fixtures.ts
import { test as base, chromium } from '@playwright/test';
import path from 'node:path';

export const test = base.extend<{
  context: import('@playwright/test').BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const extensionPath = path.resolve('dist/chrome');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker'));
    const extensionId = new URL(worker.url()).host;

    await use(extensionId);
  },
});
```

MV2 Firefox-style background pages do not create a service worker. For a
Manifest V3 service worker, `context.serviceWorkers()` is the reliable source of
the extension ID. If the extension has no background worker, read
`chrome://extensions` or navigate to a known extension page instead.

## Opening extension pages

```ts
import { expect } from '@playwright/test';
import { test } from './fixtures';

test('popup renders and stores a value', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.getByRole('button', { name: 'Ping' })).toBeVisible();
  await page.getByRole('button', { name: 'Ping' }).click();

  const pings = await page.evaluate(async () => {
    const values = await chrome.storage.local.get('pings');

    return values.pings;
  });

  expect(pings).toBe(1);
});
```

## Waiting for service worker state

Service workers can stop while the test runs. Use `evaluate` on the worker
handle to read extension state, and avoid holding the handle across long waits:

```ts
test('background records installation', async ({ context }) => {
  const worker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));

  const installed = await worker.evaluate(async () => {
    const values = await chrome.storage.local.get('installedAt');

    return values.installedAt;
  });

  expect(typeof installed).toBe('number');
});
```

## Testing content scripts

Content scripts run in the page after navigation. Wait for the DOM change the
script creates instead of sleeping:

```ts
test('content script mounts its UI', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('https://example.com');

  await expect(page.locator('[data-addonova-ui]')).toBeVisible();
});
```

Grant host permissions in the manifest and match the test URL so the content
script is injected.

## Common pitfalls

- Headless Chromium does not load extensions. Keep `headless: false` or use a
  Chromium build with extension support in headless mode.
- Reuse one persistent context per worker. Extension state is shared inside a
  context, so reset storage between tests when state matters.
- The extension ID is stable only while the same extension directory is loaded.
- Use `addonova build` rather than a development server so asset paths match the
  published extension.
- Capture a Playwright trace on failure to inspect service worker and page logs.

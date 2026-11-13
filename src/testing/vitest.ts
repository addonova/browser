import type { Plugin } from 'vitest/config';

export interface FakeBrowserPluginOptions {
  readonly setupFiles?: readonly string[];
}

export function addonovaFakeBrowser(
  options: FakeBrowserPluginOptions = {},
): Plugin {
  return {
    name: 'addonova:fake-browser',
    config() {
      return {
        test: {
          setupFiles: [
            '@addonova/browser/testing/setup',
            ...(options.setupFiles ?? []),
          ],
        },
      };
    },
  };
}

export default addonovaFakeBrowser;

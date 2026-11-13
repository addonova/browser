import { injectScript } from '@addonova/browser';

export async function run(): Promise<unknown> {
  return injectScript('content.js', { tabId: 1 });
}

import { browser } from '@addonova/browser';

export async function run(): Promise<number> {
  const openTabs = await browser.tabs.query({ active: true });
  return openTabs.length;
}

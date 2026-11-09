import { tabs } from '@addonova/browser';

export async function run(): Promise<number> {
  const openTabs = await tabs.query({ active: true });
  return openTabs.length;
}

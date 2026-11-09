import { storage, tabs } from '@addonova/browser';

export async function run(): Promise<number> {
  const [openTabs, stored] = await Promise.all([
    tabs.query({ active: true }),
    storage.local.get('counter'),
  ]);

  return openTabs.length + Object.keys(stored).length;
}

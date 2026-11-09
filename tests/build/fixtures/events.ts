import { tabs } from '@addonova/browser';

export function watch(): void {
  tabs.onCreated.addListener((tab) => {
    console.log(tab.id);
  });
}

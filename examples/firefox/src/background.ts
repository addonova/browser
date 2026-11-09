import {
  action,
  browserInfo,
  runtime,
  storage,
} from '@addonova/browser';

runtime.onInstalled.addListener(async (details) => {
  await storage.local.set({
    browser: browserInfo.name,
    engine: browserInfo.engine,
    installedReason: details.reason,
    installedAt: Date.now(),
  });

  await action.setBadgeBackgroundColor({ color: '#9059ff' });
  await action.setBadgeText({ text: 'ON' });
});

storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.clicks !== undefined) {
    console.log('Click count changed:', changes.clicks.newValue);
  }
});

action.onClicked.addListener(async () => {
  const { clicks = 0 } = await storage.local.get('clicks');

  await storage.local.set({ clicks: Number(clicks) + 1 });
});

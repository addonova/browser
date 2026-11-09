import {
  action,
  runtime,
  storage,
  tabs,
} from '@addonova/browser';

runtime.onInstalled.addListener(async (details) => {
  await storage.local.set({
    installedReason: details.reason,
    installedAt: Date.now(),
  });

  await action.setBadgeBackgroundColor({ color: '#2563eb' });
  await action.setBadgeText({ text: 'ON' });
});

action.onClicked.addListener(async (tab) => {
  const { clicks = 0 } = await storage.local.get('clicks');
  const nextClicks = Number(clicks) + 1;

  await storage.local.set({ clicks: nextClicks });
  await action.setBadgeText({ text: String(nextClicks) });

  if (tab.id !== undefined) {
    await tabs
      .sendMessage(tab.id, { type: 'example-clicked', clicks: nextClicks })
      .catch(() => undefined);
  }
});

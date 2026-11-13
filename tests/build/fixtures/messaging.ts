import { defineExtensionMessaging } from '@addonova/browser';

interface Protocol {
  ping: (data: { readonly value: string }) => string;
}

const messenger = defineExtensionMessaging<Protocol>();

export function watch(): void {
  messenger.onMessage('ping', (message) => message.data.value);
}

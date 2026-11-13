import { createExtensionMessaging } from '../messaging/index.ts';
import type { MessagingRuntime } from '../messaging/index.ts';
import type { MessengerFactory } from '../messaging/proxy.ts';

export { createInjectScript } from '../content/inject-script.ts';
export { createProxyServices } from '../messaging/proxy.ts';

export function createMessagingFactory(
  runtime: MessagingRuntime,
): MessengerFactory {
  return <P extends object = Record<string, (data?: unknown) => unknown>>() =>
    createExtensionMessaging<P>(runtime);
}

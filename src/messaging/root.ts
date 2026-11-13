import { runtime } from '../api/singletons.ts';
import { createExtensionMessaging } from './index.ts';
import type { ExtensionMessenger } from './index.ts';
import { createProxyServices } from './proxy.ts';

const createMessenger = <P extends object>() =>
  createExtensionMessaging<P>(runtime);

export function defineExtensionMessaging<
  P extends object = Record<string, (data?: unknown) => unknown>,
>(): ExtensionMessenger<P> {
  return createExtensionMessaging<P>(runtime);
}

export const defineProxyService = createProxyServices(createMessenger);

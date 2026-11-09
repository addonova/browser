import { browser } from '@addonova/browser';

export function query(namespace: 'tabs' | 'storage'): unknown {
  return browser[namespace];
}

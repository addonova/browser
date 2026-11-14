import { getBrowserInfo } from '@addonova/browser';

export function browserName(): string {
  return getBrowserInfo().name;
}

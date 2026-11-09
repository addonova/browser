import {
  getBrowserInfo as readBrowserInfo,
} from '../browser/info.ts';
import type {
  BrowserInfo,
  BrowserInfoOptions,
} from '../browser/info.ts';
import type { BrowserTarget } from '../shared/capabilities.ts';

export function createFixedBrowserInfo(target: BrowserTarget): BrowserInfo {
  return {
    get name() {
      return readBrowserInfo({ target }).name;
    },
    get version() {
      return readBrowserInfo({ target }).version;
    },
    get engine() {
      return readBrowserInfo({ target }).engine;
    },
    get manifestVersion() {
      return readBrowserInfo({ target }).manifestVersion;
    },
  };
}

export function getFixedBrowserInfo(
  target: BrowserTarget,
  options: Omit<BrowserInfoOptions, 'target'> = {},
): BrowserInfo {
  return readBrowserInfo({ ...options, target });
}

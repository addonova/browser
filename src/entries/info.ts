import { readBrowserInfoForTarget } from '../browser/info-core.ts';
import type { BrowserInfo } from '../browser/info-core.ts';
import type { BrowserInfoOptions } from '../browser/info.ts';
import type { BrowserTarget } from '../shared/capabilities.ts';

export function createFixedBrowserInfo(target: BrowserTarget): BrowserInfo {
  return {
    get name() {
      return readBrowserInfoForTarget(target).name;
    },
    get version() {
      return readBrowserInfoForTarget(target).version;
    },
    get engine() {
      return readBrowserInfoForTarget(target).engine;
    },
    get manifestVersion() {
      return readBrowserInfoForTarget(target).manifestVersion;
    },
  };
}

export function getFixedBrowserInfo(
  target: BrowserTarget,
  options: Omit<BrowserInfoOptions, 'target'> = {},
): BrowserInfo {
  return readBrowserInfoForTarget(target, options);
}

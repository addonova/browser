import { getCompileTarget } from '../build/target.ts';
import type { CompileTarget } from '../build/target.ts';
import { readBrowserInfoForTarget } from './info-core.ts';
import type { BrowserInfo } from './info-core.ts';
import type { DetectBrowserOptions } from './detect.ts';

export type { BrowserInfo } from './info-core.ts';
export { readManifestVersion } from './info-core.ts';

export interface BrowserInfoOptions extends DetectBrowserOptions {
  target?: CompileTarget;
}

let infoCache: BrowserInfo | null = null;

export function getBrowserInfo(
  options: BrowserInfoOptions = {},
): BrowserInfo {
  const useCache =
    options.scope === undefined &&
    options.userAgent === undefined &&
    options.target === undefined;

  if (useCache && infoCache !== null) {
    return infoCache;
  }

  const { target: requestedTarget, ...detectOptions } = options;
  const target = requestedTarget ?? getCompileTarget();
  const info = readBrowserInfoForTarget(target, detectOptions);

  if (useCache) {
    infoCache = info;
  }

  return info;
}

export function resetBrowserInfoCache(): void {
  infoCache = null;
}

export const browserInfo: BrowserInfo = {
  get name() {
    return getBrowserInfo().name;
  },
  get version() {
    return getBrowserInfo().version;
  },
  get engine() {
    return getBrowserInfo().engine;
  },
  get manifestVersion() {
    return getBrowserInfo().manifestVersion;
  },
};

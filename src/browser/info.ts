import { getCompileTarget } from '../build/target.ts';
import type { CompileTarget } from '../build/target.ts';
import { isManifestVersion } from '../shared/capabilities.ts';
import type {
  BrowserEngine,
  BrowserTarget,
  ManifestVersion,
} from '../shared/capabilities.ts';
import { readProperty } from '../shared/objects.ts';
import {
  detectBrowser,
  detectBrowserVersion,
  readUserAgent,
} from './detect.ts';
import type { DetectBrowserOptions } from './detect.ts';

export interface BrowserInfo {
  readonly name: BrowserTarget | 'unknown';
  readonly version: string;
  readonly engine: BrowserEngine;
  readonly manifestVersion: ManifestVersion | null;
}

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

  const target = options.target ?? getCompileTarget();
  const detection = detectBrowser({
    ...(options.scope === undefined ? {} : { scope: options.scope }),
    ...(options.userAgent === undefined ? {} : { userAgent: options.userAgent }),
    resolveName: target === 'auto',
  });
  const name = target === 'auto' ? detection.name : target;
  const userAgent =
    options.userAgent === undefined
      ? readUserAgent(options.scope ?? globalThis)
      : options.userAgent;
  const version =
    name === 'unknown'
      ? ''
      : target === 'auto'
        ? detection.version
        : detectBrowserVersion(name, userAgent);

  const info: BrowserInfo = {
    name,
    version,
    engine: target === 'auto' ? detection.engine : engineForTarget(name),
    manifestVersion: readManifestVersion(detection.api),
  };

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

export function readManifestVersion(api: unknown): ManifestVersion | null {
  const runtime = readProperty(api, 'runtime');
  const getManifest = readProperty(runtime, 'getManifest');

  if (typeof getManifest !== 'function') {
    return null;
  }

  try {
    const manifest = (getManifest as () => unknown).call(runtime);
    const value = readProperty(manifest, 'manifest_version');

    return isManifestVersion(value) ? value : null;
  } catch {
    return null;
  }
}

function engineForTarget(name: BrowserTarget | 'unknown'): BrowserEngine {
  if (name === 'unknown') {
    return 'unknown';
  }

  return name === 'firefox' ? 'gecko' : 'chromium';
}

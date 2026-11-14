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

export type BrowserInfoTarget = BrowserTarget | 'auto';

export function readBrowserInfoForTarget(
  target: BrowserInfoTarget,
  options: DetectBrowserOptions = {},
): BrowserInfo {
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

  return {
    name,
    version,
    engine: target === 'auto' ? detection.engine : engineForTarget(name),
    manifestVersion: readManifestVersion(detection.api),
  };
}

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

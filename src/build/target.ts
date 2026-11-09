import { isBrowserTarget } from '../shared/capabilities.ts';
import type { BrowserTarget } from '../shared/capabilities.ts';

export type CompileTarget = BrowserTarget | 'auto';

declare const __ADDONOVA_BROWSER__: unknown;

export function normalizeCompileTarget(value: unknown): CompileTarget {
  if (value === 'auto' || value === undefined || value === null || value === '') {
    return 'auto';
  }

  return isBrowserTarget(value) ? value : 'auto';
}

export function getCompileTarget(
  read: () => unknown = readCompileTarget,
): CompileTarget {
  try {
    return normalizeCompileTarget(read());
  } catch {
    return 'auto';
  }
}

function readCompileTarget(): unknown {
  return typeof __ADDONOVA_BROWSER__ === 'undefined'
    ? undefined
    : __ADDONOVA_BROWSER__;
}

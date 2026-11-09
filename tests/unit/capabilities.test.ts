import { describe, expect, it } from '@guchho/test';

import {
  BROWSER_TARGETS,
  availableCapability,
  isBrowserTarget,
  isManifestVersion,
  unavailableCapability,
} from '../../src/shared/capabilities.ts';

describe('browser targets', () => {
  it('lists the supported targets', () => {
    expect(BROWSER_TARGETS).toEqual(['chrome', 'chromium', 'firefox', 'edge']);
  });

  it('validates browser target values', () => {
    expect(isBrowserTarget('chrome')).toBe(true);
    expect(isBrowserTarget('firefox')).toBe(true);
    expect(isBrowserTarget('safari')).toBe(false);
    expect(isBrowserTarget(3)).toBe(false);
  });

  it('validates manifest versions', () => {
    expect(isManifestVersion(2)).toBe(true);
    expect(isManifestVersion(3)).toBe(true);
    expect(isManifestVersion(1)).toBe(false);
    expect(isManifestVersion('3')).toBe(false);
  });
});

describe('capability availability', () => {
  it('describes an available namespace', () => {
    expect(availableCapability({ namespace: 'tabs' })).toEqual({
      namespace: 'tabs',
      available: true,
    });
  });

  it('describes an available method', () => {
    expect(
      availableCapability({ namespace: 'tabs', method: 'query' }),
    ).toEqual({
      namespace: 'tabs',
      method: 'query',
      available: true,
    });
  });

  it('describes an unavailable method with a reason', () => {
    expect(
      unavailableCapability(
        { namespace: 'scripting', method: 'executeScript' },
        'unsupported-manifest',
      ),
    ).toEqual({
      namespace: 'scripting',
      method: 'executeScript',
      available: false,
      reason: 'unsupported-manifest',
    });
  });
});

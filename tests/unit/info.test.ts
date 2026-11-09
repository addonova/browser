import { describe, expect, it } from '@guchho/test';

import {
  browserInfo,
  getBrowserInfo,
  readManifestVersion,
} from '../../src/browser/info.ts';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';

describe('readManifestVersion', () => {
  it('reads the manifest version', () => {
    const api = {
      runtime: {
        getManifest: () => ({ manifest_version: 3 }),
      },
    };

    expect(readManifestVersion(api)).toBe(3);
  });

  it('returns null for missing or invalid manifests', () => {
    expect(readManifestVersion({})).toBeNull();
    expect(
      readManifestVersion({
        runtime: { getManifest: () => ({ manifest_version: 1 }) },
      }),
    ).toBeNull();
    expect(
      readManifestVersion({
        runtime: {
          getManifest: () => {
            throw new Error('not in an extension');
          },
        },
      }),
    ).toBeNull();
  });
});

describe('getBrowserInfo', () => {
  it('assembles info for Chrome', () => {
    const info = getBrowserInfo({
      scope: {
        chrome: {
          runtime: {
            id: 'ext-id',
            getManifest: () => ({ manifest_version: 3 }),
          },
        },
      },
      userAgent: CHROME_UA,
    });

    expect(info).toEqual({
      name: 'chrome',
      version: '120.0.0.0',
      engine: 'chromium',
      manifestVersion: 3,
    });
  });

  it('honors a fixed build-time target', () => {
    const info = getBrowserInfo({
      scope: {
        browser: {
          runtime: {
            id: 'ext-id',
            getManifest: () => ({ manifest_version: 2 }),
          },
        },
      },
      userAgent: FIREFOX_UA,
      target: 'firefox',
    });

    expect(info.name).toBe('firefox');
    expect(info.engine).toBe('gecko');
    expect(info.version).toBe('121.0');
    expect(info.manifestVersion).toBe(2);
  });

  it('reports an unknown environment outside an extension', () => {
    expect(getBrowserInfo({ scope: {} }).name).toBe('unknown');
  });

  it('exposes a lazily resolved browserInfo object', () => {
    expect(browserInfo.name).toBe('unknown');
    expect(browserInfo.manifestVersion).toBeNull();
  });
});

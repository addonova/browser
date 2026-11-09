import { describe, expect, it } from '@guchho/test';

import * as chromeEntry from '../../src/entries/chrome.ts';
import * as chromiumEntry from '../../src/entries/chromium.ts';
import * as edgeEntry from '../../src/entries/edge.ts';
import * as firefoxEntry from '../../src/entries/firefox.ts';

const entries = [
  { entry: chromeEntry, name: 'chrome' },
  { entry: chromiumEntry, name: 'chromium' },
  { entry: edgeEntry, name: 'edge' },
  { entry: firefoxEntry, name: 'firefox' },
] as const;

const namespaces = [
  'action',
  'alarms',
  'bookmarks',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'i18n',
  'notifications',
  'permissions',
  'runtime',
  'scripting',
  'sessions',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
] as const;

describe('browser-specific entries', () => {
  for (const { entry, name } of entries) {
    it(`exposes the ${name} target without extension globals`, () => {
      expect(entry.browserInfo.name).toBe(name);
      expect(entry.getBrowserInfo().name).toBe(name);
      expect(entry.getBrowserInfo().manifestVersion).toBeNull();
      expect(entry.isBrowserSupported()).toBe(false);
      expect(entry.supports('tabs')).toBe(false);
      expect(entry.getAvailability('tabs')).toMatchObject({
        namespace: 'tabs',
        available: false,
        reason: 'unsupported-browser',
      });

      expect(entry.browser).toBeDefined();

      for (const namespace of namespaces) {
        expect(entry.browser).toHaveProperty(namespace);
      }
    });
  }
});

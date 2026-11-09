import { describe, expect, it } from '@guchho/test';

import type {
  Browser as RootBrowser,
  BrowserInfo as RootBrowserInfo,
  TabsApi,
} from '../../src/index.ts';
import {
  browser as chromeBrowser,
  getBrowserInfo as getChromeInfo,
  tabs as chromeTabs,
} from '../../src/entries/chrome.ts';
import {
  browser as chromiumBrowser,
  getBrowserInfo as getChromiumInfo,
  tabs as chromiumTabs,
} from '../../src/entries/chromium.ts';
import {
  browser as edgeBrowser,
  getBrowserInfo as getEdgeInfo,
  tabs as edgeTabs,
} from '../../src/entries/edge.ts';
import {
  browser as firefoxBrowser,
  getBrowserInfo as getFirefoxInfo,
  tabs as firefoxTabs,
} from '../../src/entries/firefox.ts';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;

type Expect<Value extends true> = Value;

type ChromeTabs = Expect<Equal<typeof chromeTabs, TabsApi>>;
type ChromiumTabs = Expect<Equal<typeof chromiumTabs, TabsApi>>;
type EdgeTabs = Expect<Equal<typeof edgeTabs, TabsApi>>;
type FirefoxTabs = Expect<Equal<typeof firefoxTabs, TabsApi>>;
type ChromeBrowser = Expect<Equal<typeof chromeBrowser, RootBrowser>>;
type ChromiumBrowser = Expect<Equal<typeof chromiumBrowser, RootBrowser>>;
type EdgeBrowser = Expect<Equal<typeof edgeBrowser, RootBrowser>>;
type FirefoxBrowser = Expect<Equal<typeof firefoxBrowser, RootBrowser>>;
type ChromeInfo = Expect<Equal<ReturnType<typeof getChromeInfo>, RootBrowserInfo>>;
type ChromiumInfo = Expect<
  Equal<ReturnType<typeof getChromiumInfo>, RootBrowserInfo>
>;
type EdgeInfo = Expect<Equal<ReturnType<typeof getEdgeInfo>, RootBrowserInfo>>;
type FirefoxInfo = Expect<
  Equal<ReturnType<typeof getFirefoxInfo>, RootBrowserInfo>
>;

describe('browser-specific entry types', () => {
  it('exposes the same public surface as the root entry', () => {
    const assertions = [
      true satisfies ChromeTabs,
      true satisfies ChromiumTabs,
      true satisfies EdgeTabs,
      true satisfies FirefoxTabs,
      true satisfies ChromeBrowser,
      true satisfies ChromiumBrowser,
      true satisfies EdgeBrowser,
      true satisfies FirefoxBrowser,
      true satisfies ChromeInfo,
      true satisfies ChromiumInfo,
      true satisfies EdgeInfo,
      true satisfies FirefoxInfo,
    ];

    expect(assertions.every(Boolean)).toBe(true);
  });
});

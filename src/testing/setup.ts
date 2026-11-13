import { afterAll, beforeEach } from 'vitest';
import {
  installFakeBrowser,
  resetFakeBrowser,
  uninstallFakeBrowser,
} from './index.ts';

installFakeBrowser();
beforeEach(() => resetFakeBrowser());
afterAll(() => uninstallFakeBrowser());

import { afterAll, beforeEach } from '@guchho/test';
import {
  installFakeBrowser,
  resetFakeBrowser,
  uninstallFakeBrowser,
} from './index.ts';

installFakeBrowser();
beforeEach(() => resetFakeBrowser());
afterAll(() => uninstallFakeBrowser());

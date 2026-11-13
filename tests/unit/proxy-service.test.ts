import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from '@guchho/test';

import { defineProxyService } from '../../src/messaging/root.ts';
import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  installFakeBrowser,
  resetFakeBrowser,
  uninstallFakeBrowser,
} from '../../src/testing/fake-browser.ts';

interface CounterService {
  add(value: number): number;
  read(): Promise<number>;
  fail(): void;
}

beforeEach(() => {
  installFakeBrowser();
  resetFakeBrowser();
});

afterEach(() => {
  uninstallFakeBrowser();
});

describe('proxy services', () => {
  it('runs proxied method calls against the registered service', async () => {
    const [register, getCounter] = defineProxyService(
      'counter-test',
      (start: number): CounterService => {
        let value = start;

        return {
          add(amount) {
            value += amount;
            return value;
          },
          async read() {
            return value;
          },
          fail() {
            throw new Error('counter failed');
          },
        };
      },
    );
    const service = register(10);
    const proxy = getCounter();

    expect(service.add(1)).toBe(11);
    await expect(proxy.add(5)).resolves.toBe(16);
    await expect(proxy.read()).resolves.toBe(16);
    await expect(proxy.fail()).rejects.toThrow('counter failed');

    register.dispose();
  });

  it('reports duplicate registrations and unknown methods', async () => {
    const [register, getService] = defineProxyService(
      'duplicate-test',
      (): CounterService => ({
        add: (value) => value,
        read: async () => 0,
        fail() {},
      }),
    );
    register();

    expect(() => register()).toThrow(/already registered/);

    const proxy = getService() as unknown as {
      missing(): Promise<unknown>;
    };

    try {
      await proxy.missing();
      throw new Error('expected rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(BrowserApiError);
      expect((error as BrowserApiError).code).toBe(
        'BROWSER_UNSUPPORTED_API',
      );
    }

    register.dispose();
  });
});

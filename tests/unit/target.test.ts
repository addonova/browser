import { describe, expect, it } from '@guchho/test';

import {
  getCompileTarget,
  normalizeCompileTarget,
} from '../../src/build/target.ts';

describe('normalizeCompileTarget', () => {
  it('accepts supported browser targets', () => {
    expect(normalizeCompileTarget('chrome')).toBe('chrome');
    expect(normalizeCompileTarget('chromium')).toBe('chromium');
    expect(normalizeCompileTarget('firefox')).toBe('firefox');
    expect(normalizeCompileTarget('edge')).toBe('edge');
  });

  it('falls back to auto for unknown values', () => {
    expect(normalizeCompileTarget('auto')).toBe('auto');
    expect(normalizeCompileTarget(undefined)).toBe('auto');
    expect(normalizeCompileTarget(null)).toBe('auto');
    expect(normalizeCompileTarget('')).toBe('auto');
    expect(normalizeCompileTarget('safari')).toBe('auto');
    expect(normalizeCompileTarget(3)).toBe('auto');
  });
});

describe('getCompileTarget', () => {
  it('reads a supplied compile-time value', () => {
    expect(getCompileTarget(() => 'firefox')).toBe('firefox');
    expect(getCompileTarget(() => 'edge')).toBe('edge');
  });

  it('defaults to auto when unset or failing', () => {
    expect(getCompileTarget(() => undefined)).toBe('auto');
    expect(
      getCompileTarget(() => {
        throw new Error('unavailable');
      }),
    ).toBe('auto');
  });

  it('defaults to auto without a build-time definition', () => {
    expect(getCompileTarget()).toBe('auto');
  });
});

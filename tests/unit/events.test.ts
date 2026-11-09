import { describe, expect, it } from '@guchho/test';

import { BrowserApiError } from '../../src/shared/errors.ts';
import {
  isBrowserEvent,
  passthroughEvent,
  requireEvent,
} from '../../src/shared/events.ts';
import type { BrowserEvent } from '../../src/shared/events.ts';

function createEvent(): BrowserEvent<(value: number) => void> {
  const listeners = new Set<(value: number) => void>();

  return {
    addListener(listener) {
      listeners.add(listener);
    },
    removeListener(listener) {
      listeners.delete(listener);
    },
    hasListener(listener) {
      return listeners.has(listener);
    },
    hasListeners() {
      return listeners.size > 0;
    },
  };
}

describe('events', () => {
  it('recognizes browser events', () => {
    expect(isBrowserEvent(createEvent())).toBe(true);
    expect(isBrowserEvent({ addListener() {} })).toBe(false);
    expect(isBrowserEvent(undefined)).toBe(false);
  });

  it('passes the native event through unchanged', () => {
    const event = createEvent();
    const listener = (): void => undefined;

    const result = passthroughEvent(event);
    result.addListener(listener);

    expect(result).toBe(event);
    expect(event.hasListener?.(listener)).toBe(true);
  });

  it('throws an explicit error for a missing event', () => {
    try {
      requireEvent(undefined, 'tabs.onCreated');
      throw new Error('expected a BrowserApiError');
    } catch (error) {
      expect(error).toBeInstanceOf(BrowserApiError);
      expect((error as BrowserApiError).code).toBe('BROWSER_UNSUPPORTED_API');
      expect((error as BrowserApiError).api).toBe('tabs.onCreated');
    }
  });
});

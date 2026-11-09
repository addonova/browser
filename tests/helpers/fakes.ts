import type { BrowserEvent } from '../../src/shared/events.ts';

export type FakeListener<Args extends readonly unknown[] = readonly unknown[]> = (
  ...args: Args
) => unknown;

export interface FakeEvent<
  Args extends readonly unknown[] = readonly unknown[],
> extends BrowserEvent<FakeListener<Args>> {
  emit(...args: Args): void;
  readonly listenerCount: number;
}

export function createCallbackMethod(
  result: unknown,
  calls?: unknown[][],
): (...args: unknown[]) => void {
  return (...args) => {
    const callback = args[args.length - 1];

    if (typeof callback !== 'function') {
      throw new Error('Expected a trailing callback.');
    }

    calls?.push(args.slice(0, -1));
    (callback as (value: unknown) => void)(result);
  };
}

export function createPromiseMethod(
  result: unknown,
  calls?: unknown[][],
): (...args: unknown[]) => Promise<unknown> {
  return (...args) => {
    calls?.push(args);
    return Promise.resolve(result);
  };
}

export function createEvent<
  Args extends readonly unknown[] = readonly unknown[],
>(): FakeEvent<Args> {
  const listeners = new Set<FakeListener<Args>>();

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
    emit(...args) {
      for (const listener of [...listeners]) {
        listener(...args);
      }
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

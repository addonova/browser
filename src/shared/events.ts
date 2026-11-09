import { BrowserApiError } from './errors.ts';

export type BrowserEventListener = (...args: never[]) => unknown;

export interface BrowserEvent<
  TListener extends BrowserEventListener = BrowserEventListener,
> {
  addListener(listener: TListener): void;
  removeListener(listener: TListener): void;
  hasListener?(listener: TListener): boolean;
  hasListeners?(): boolean;
}

export function isBrowserEvent(value: unknown): value is BrowserEvent {
  return (
    isRecord(value) &&
    typeof value.addListener === 'function' &&
    typeof value.removeListener === 'function'
  );
}

export function requireEvent<TEvent extends BrowserEvent>(
  event: TEvent | undefined | null,
  api: string,
): TEvent {
  if (event === undefined || event === null || !isBrowserEvent(event)) {
    throw new BrowserApiError(
      'BROWSER_UNSUPPORTED_API',
      `The browser API "${api}" is not available in this environment.`,
      { api },
    );
  }

  return event;
}

export function passthroughEvent<TEvent extends BrowserEvent>(
  event: TEvent,
): TEvent {
  return event;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

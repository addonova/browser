import { BrowserApiError } from '../shared/errors.ts';

export type ContentScriptTimer = ReturnType<typeof globalThis.setTimeout>;

export interface ContentScriptRuntime {
  readonly id?: string;
}

export interface ContentScriptContextOptions {
  readonly validateRuntime?: boolean;
  readonly runtime?: ContentScriptRuntime;
}

export interface ContentScriptContext {
  readonly isValid: boolean;
  readonly signal: AbortSignal;
  setTimeout(
    callback: (...args: unknown[]) => void,
    timeout?: number,
    ...args: unknown[]
  ): ContentScriptTimer;
  clearTimeout(timer: ContentScriptTimer): void;
  setInterval(
    callback: (...args: unknown[]) => void,
    timeout?: number,
    ...args: unknown[]
  ): ContentScriptTimer;
  clearInterval(timer: ContentScriptTimer): void;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(id: number): void;
  addEventListener<Target extends EventTarget>(
    target: Target,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): () => void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): () => void;
  onInvalidated(callback: () => void): () => void;
  invalidate(): void;
}

interface TrackedListener {
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListenerOrEventListenerObject;
  readonly options?: boolean | AddEventListenerOptions;
}

export function createContentScriptContext(
  options: ContentScriptContextOptions = {},
): ContentScriptContext {
  const validateRuntime = options.validateRuntime ?? true;
  const runtime = options.runtime ?? getGlobalRuntime();
  const controller = new AbortController();
  const timers = new Set<ContentScriptTimer>();
  const intervals = new Set<ContentScriptTimer>();
  const animationFrames = new Set<number>();
  const listeners = new Map<() => void, TrackedListener>();
  const invalidationCallbacks = new Set<() => void>();

  const isValid = (): boolean => {
    if (controller.signal.aborted) {
      return false;
    }

    if (!validateRuntime) {
      return true;
    }

    try {
      return runtime?.id !== undefined && runtime.id !== '';
    } catch {
      return false;
    }
  };

  const context: ContentScriptContext = {
    get isValid() {
      return isValid();
    },
    signal: controller.signal,
    setTimeout(
      callback: (...args: unknown[]) => void,
      timeout = 0,
      ...args: unknown[]
    ): ContentScriptTimer {
      const timer = globalThis.setTimeout(() => {
        timers.delete(timer);

        if (!controller.signal.aborted) {
          callback(...args);
        }
      }, timeout);
      timers.add(timer);

      return timer;
    },
    clearTimeout(timer: ContentScriptTimer): void {
      timers.delete(timer);
      globalThis.clearTimeout(timer);
    },
    setInterval(
      callback: (...args: unknown[]) => void,
      timeout = 0,
      ...args: unknown[]
    ): ContentScriptTimer {
      const timer = globalThis.setInterval(() => {
        if (!controller.signal.aborted) {
          callback(...args);
        }
      }, timeout);
      intervals.add(timer);

      return timer;
    },
    clearInterval(timer: ContentScriptTimer): void {
      intervals.delete(timer);
      globalThis.clearInterval(timer);
    },
    requestAnimationFrame(callback: FrameRequestCallback): number {
      if (typeof globalThis.requestAnimationFrame !== 'function') {
        throw new BrowserApiError(
          'BROWSER_UNSUPPORTED_API',
          'requestAnimationFrame is not available in this environment.',
        );
      }

      const id = globalThis.requestAnimationFrame((time) => {
        animationFrames.delete(id);

        if (!controller.signal.aborted) {
          callback(time);
        }
      });
      animationFrames.add(id);

      return id;
    },
    cancelAnimationFrame(id: number): void {
      animationFrames.delete(id);
      globalThis.cancelAnimationFrame?.(id);
    },
    addEventListener<Target extends EventTarget>(
      targetOrType: Target | string,
      typeOrListener: string | EventListenerOrEventListenerObject,
      listenerOrOptions?:
        | EventListenerOrEventListenerObject
        | boolean
        | AddEventListenerOptions,
      maybeOptions?: boolean | AddEventListenerOptions,
    ): () => void {
      const hasTarget = typeof targetOrType !== 'string';
      const target = hasTarget
        ? (targetOrType as EventTarget)
        : getDefaultEventTarget();
      const type = hasTarget ? (typeOrListener as string) : targetOrType;
      const listener = hasTarget
        ? (listenerOrOptions as EventListenerOrEventListenerObject)
        : (typeOrListener as EventListenerOrEventListenerObject);
      const options = hasTarget
        ? maybeOptions
        : (listenerOrOptions as boolean | AddEventListenerOptions | undefined);

      if (target === undefined) {
        throw new BrowserApiError(
          'BROWSER_UNSUPPORTED_ENVIRONMENT',
          'No event target is available for the content script context.',
        );
      }

      target.addEventListener(type, listener, options);

      const remove = (): void => {
        target.removeEventListener(type, listener, options);
        listeners.delete(remove);
      };
      listeners.set(remove, {
        target,
        type,
        listener,
        ...(options === undefined ? {} : { options }),
      });

      return remove;
    },
    onInvalidated(callback: () => void): () => void {
      if (controller.signal.aborted) {
        callback();

        return () => {};
      }

      invalidationCallbacks.add(callback);

      return () => invalidationCallbacks.delete(callback);
    },
    invalidate(): void {
      if (controller.signal.aborted) {
        return;
      }

      controller.abort();

      for (const timer of timers) {
        globalThis.clearTimeout(timer);
      }
      timers.clear();

      for (const timer of intervals) {
        globalThis.clearInterval(timer);
      }
      intervals.clear();

      for (const id of animationFrames) {
        globalThis.cancelAnimationFrame?.(id);
      }
      animationFrames.clear();

      for (const remove of [...listeners.keys()]) {
        remove();
      }
      listeners.clear();

      for (const callback of [...invalidationCallbacks]) {
        callback();
      }
      invalidationCallbacks.clear();
    },
  };

  if (typeof window !== 'undefined') {
    context.addEventListener(window, 'pagehide', () => context.invalidate(), {
      once: true,
    });
  }

  return context;
}

function getGlobalRuntime(): ContentScriptRuntime | undefined {
  const global = globalThis as {
    browser?: { readonly runtime?: ContentScriptRuntime };
    chrome?: { readonly runtime?: ContentScriptRuntime };
  };

  return global.browser?.runtime ?? global.chrome?.runtime;
}

function getDefaultEventTarget(): EventTarget | undefined {
  if (typeof window !== 'undefined') {
    return window;
  }

  if (typeof document !== 'undefined') {
    return document;
  }

  return undefined;
}

import { BrowserApiError } from '../shared/errors.ts';
import type { ContentScriptContext } from './context.ts';

export type UiAnchor =
  | string
  | Element
  | (() => string | Element | null | undefined)
  | null;

export type UiAppendMode =
  | 'first'
  | 'last'
  | 'before'
  | 'after'
  | 'replace'
  | ((anchor: Element, ui: HTMLElement) => void);

export type UiPosition = 'inline' | 'overlay' | 'modal';

export type UiAlignment =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface AutoMountOptions {
  readonly once?: boolean;
}

export interface ContentScriptUi<T> {
  readonly mounted: T | undefined;
  readonly element: HTMLElement | undefined;
  readonly isValid: boolean;
  mount(): Promise<T>;
  remove(): void;
  unmount(): void;
  autoMount(options?: AutoMountOptions): () => void;
}

export interface BaseUiOptions<T> {
  readonly anchor?: UiAnchor;
  readonly append?: UiAppendMode;
  readonly position?: UiPosition;
  readonly alignment?: UiAlignment;
  readonly zIndex?: number;
  readonly onRemove?: (mounted: T | undefined) => void;
}

export interface IntegratedUiOptions<T>
  extends BaseUiOptions<T> {
  readonly tag?: string;
  readonly onMount?: (container: HTMLElement) => T | Promise<T>;
}

export interface ShadowRootUiOptions<T>
  extends BaseUiOptions<T> {
  readonly tag?: string;
  readonly name?: string;
  readonly css?: string;
  readonly mode?: ShadowRootMode;
  readonly isolateEvents?: boolean;
  readonly onMount?: (container: HTMLElement) => T | Promise<T>;
}

export interface IframeUiOptions<T>
  extends BaseUiOptions<T> {
  readonly page: string;
  readonly tag?: string;
  readonly onMount?: (
    iframe: HTMLIFrameElement,
    wrapper: HTMLElement,
  ) => T | Promise<T>;
}

export interface ShadowRootContentScriptUi<T>
  extends ContentScriptUi<T> {
  readonly shadow: ShadowRoot | undefined;
  readonly shadowHost: HTMLElement | undefined;
}

interface UiInternals<T> {
  createHost(document: Document): HTMLElement;
  createContainer(host: HTMLElement, document: Document): HTMLElement;
  mount(container: HTMLElement, host: HTMLElement): Promise<T>;
  readonly onRemove?: (mounted: T | undefined) => void;
}

export function createIntegratedUi<T = HTMLElement>(
  ctx: ContentScriptContext,
  options: IntegratedUiOptions<T> = {},
): ContentScriptUi<T> {
  return createUi(ctx, options, {
    createHost(document) {
      return createHost(document, options.tag ?? 'div');
    },
    createContainer(host) {
      return host;
    },
    async mount(container) {
      return options.onMount === undefined
        ? (container as T)
        : options.onMount(container);
    },
    ...(options.onRemove === undefined
      ? {}
      : { onRemove: options.onRemove }),
  });
}

export function createShadowRootUi<T = HTMLElement>(
  ctx: ContentScriptContext,
  options: ShadowRootUiOptions<T> = {},
): ShadowRootContentScriptUi<T> {
  let shadow: ShadowRoot | undefined;
  let shadowHost: HTMLElement | undefined;

  const ui = createUi<T>(ctx, options, {
    createHost(document) {
      shadowHost = createHost(document, options.tag ?? 'div');

      if (options.name !== undefined) {
        shadowHost.setAttribute('data-addonova-ui-name', options.name);
      }

      if (options.isolateEvents === true) {
        isolateEvents(shadowHost);
      }

      return shadowHost;
    },
    createContainer(host, document) {
      shadow = host.attachShadow({ mode: options.mode ?? 'open' });

      if (options.css !== undefined && options.css !== '') {
        const style = document.createElement('style');
        style.textContent = options.css;
        shadow.append(style);
      }

      const container = document.createElement('div');
      shadow.append(container);

      return container;
    },
    async mount(container) {
      return options.onMount === undefined
        ? (container as T)
        : options.onMount(container);
    },
    ...(options.onRemove === undefined
      ? {}
      : { onRemove: options.onRemove }),
  });

  return Object.defineProperties(ui, {
    shadow: {
      configurable: true,
      enumerable: true,
      get(): ShadowRoot | undefined {
        return shadow;
      },
    },
    shadowHost: {
      configurable: true,
      enumerable: true,
      get(): HTMLElement | undefined {
        return shadowHost;
      },
    },
  }) as ShadowRootContentScriptUi<T>;
}

export function createIframeUi<T = HTMLIFrameElement>(
  ctx: ContentScriptContext,
  options: IframeUiOptions<T>,
): ContentScriptUi<T> {
  return createUi<T>(ctx, options, {
    createHost(document) {
      return createHost(document, options.tag ?? 'div');
    },
    createContainer(host, document) {
      const iframe = document.createElement('iframe');
      iframe.src = resolveIframeUrl(options.page);
      host.append(iframe);

      return iframe;
    },
    async mount(container, host) {
      const iframe = container as HTMLIFrameElement;

      return options.onMount === undefined
        ? (iframe as T)
        : options.onMount(iframe, host);
    },
    ...(options.onRemove === undefined
      ? {}
      : { onRemove: options.onRemove }),
  });
}

function createUi<T>(
  ctx: ContentScriptContext,
  options: BaseUiOptions<T>,
  internals: UiInternals<T>,
): ContentScriptUi<T> {
  let host: HTMLElement | undefined;
  let mounted: T | undefined;
  let hasMounted = false;
  let mounting: Promise<T> | undefined;
  let stopAutoMount: (() => void) | undefined;

  const requireDocument = (): Document => {
    if (typeof document === 'undefined') {
      throw new BrowserApiError(
        'BROWSER_UNSUPPORTED_ENVIRONMENT',
        'A DOM document is required to mount a content script UI.',
      );
    }

    return document;
  };

  const attach = (hostElement: HTMLElement): void => {
    const document = requireDocument();
    const anchor = resolveAnchor(options.anchor, document);

    if (anchor === null) {
      throw new BrowserApiError(
        'BROWSER_API_FAILED',
        'Could not find an anchor element for the content script UI.',
      );
    }

    applyPosition(hostElement, options);
    insertUi(anchor, hostElement, options.append ?? 'last');
  };

  const mount = async (): Promise<T> => {
    if (hasMounted) {
      return mounted as T;
    }

    if (mounting !== undefined) {
      return mounting;
    }

    if (!ctx.isValid) {
      throw new BrowserApiError(
        'BROWSER_UNSUPPORTED_ENVIRONMENT',
        'The content script context is no longer valid.',
      );
    }

    mounting = (async () => {
      const document = requireDocument();
      host = internals.createHost(document);

      try {
        attach(host);
        const container = internals.createContainer(host, document);
        mounted = await internals.mount(container, host);
        hasMounted = true;

        return mounted;
      } catch (error) {
        host.remove();
        host = undefined;
        throw error;
      } finally {
        mounting = undefined;
      }
    })();

    return mounting;
  };

  const remove = (): void => {
    if (!hasMounted && host === undefined) {
      return;
    }

    const currentHost = host;
    const currentMounted = mounted;

    hasMounted = false;
    mounted = undefined;
    host = undefined;

    try {
      internals.onRemove?.(currentMounted);
    } finally {
      currentHost?.remove();
    }
  };

  const autoMount = (autoOptions: AutoMountOptions = {}): (() => void) => {
    if (stopAutoMount !== undefined) {
      return stopAutoMount;
    }

    if (typeof document === 'undefined' || document.documentElement === null) {
      return () => {};
    }

    let stopped = false;
    let invalidatedCleanup: (() => void) | undefined;

    const check = (): void => {
      if (stopped) {
        return;
      }

      const anchor = resolveAnchor(options.anchor, document);

      if (anchor === null) {
        if (hasMounted || host !== undefined) {
          remove();
        }

        return;
      }

      if (!hasMounted) {
        void mount().catch(() => {});
      } else if (host !== undefined && !host.isConnected) {
        remove();
        void mount().catch(() => {});
      }

      if (autoOptions.once === true && hasMounted) {
        stop();
      }
    };

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const stop = (): void => {
      if (stopped) {
        return;
      }

      stopped = true;
      observer.disconnect();
      invalidatedCleanup?.();
      stopAutoMount = undefined;
    };

    invalidatedCleanup = ctx.onInvalidated(() => {
      stop();
      remove();
    });
    stopAutoMount = stop;
    check();

    return stop;
  };

  return {
    get mounted() {
      return mounted;
    },
    get element() {
      return host;
    },
    get isValid() {
      return ctx.isValid;
    },
    mount,
    remove,
    unmount: remove,
    autoMount,
  };
}

function createHost(document: Document, tag: string): HTMLElement {
  const host = document.createElement(tag);
  host.setAttribute('data-addonova-ui', '');

  return host;
}

function resolveAnchor(
  anchor: UiAnchor | undefined,
  document: Document,
): Element | null {
  if (anchor === undefined) {
    return document.body ?? document.documentElement;
  }

  if (anchor === null) {
    return null;
  }

  const resolved = typeof anchor === 'function' ? anchor() : anchor;

  if (resolved === null || resolved === undefined) {
    return null;
  }

  return typeof resolved === 'string'
    ? document.querySelector(resolved)
    : resolved;
}

function insertUi(
  anchor: Element,
  ui: HTMLElement,
  mode: UiAppendMode,
): void {
  if (typeof mode === 'function') {
    mode(anchor, ui);
    return;
  }

  switch (mode) {
    case 'first':
      anchor.prepend(ui);
      break;
    case 'last':
      anchor.append(ui);
      break;
    case 'before':
      anchor.before(ui);
      break;
    case 'after':
      anchor.after(ui);
      break;
    case 'replace':
      anchor.replaceWith(ui);
      break;
  }
}

function applyPosition<T>(
  host: HTMLElement,
  options: BaseUiOptions<T>,
): void {
  const position = options.position ?? 'inline';

  if (position === 'inline') {
    return;
  }

  host.style.position = 'fixed';
  host.style.zIndex = String(options.zIndex ?? 2147483647);

  if (position === 'modal') {
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100%';
    host.style.height = '100%';
    host.style.display = 'flex';
    host.style.alignItems = 'center';
    host.style.justifyContent = 'center';
    return;
  }

  const alignment = options.alignment ?? 'top-left';
  const [vertical, horizontal] = alignment.split('-') as [
    'top' | 'bottom',
    'left' | 'right',
  ];

  host.style[vertical] = '0';
  host.style[horizontal] = '0';
}

function isolateEvents(host: HTMLElement): void {
  const events = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'pointerdown',
    'pointerup',
    'keydown',
    'keyup',
    'keypress',
    'input',
    'change',
    'submit',
    'wheel',
    'touchstart',
    'touchend',
  ];

  for (const event of events) {
    host.addEventListener(event, (value) => value.stopPropagation());
  }
}

function resolveIframeUrl(page: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(page)) {
    return page;
  }

  const runtime = getGlobalRuntime();

  if (runtime === undefined || typeof runtime.getURL !== 'function') {
    throw new BrowserApiError(
      'BROWSER_UNSUPPORTED_ENVIRONMENT',
      'The extension runtime is not available to resolve the iframe URL.',
    );
  }

  return runtime.getURL(page);
}

function getGlobalRuntime():
  | { readonly getURL?: (path: string) => string }
  | undefined {
  const global = globalThis as {
    browser?: { readonly runtime?: { getURL?: (path: string) => string } };
    chrome?: { readonly runtime?: { getURL?: (path: string) => string } };
  };

  return global.browser?.runtime ?? global.chrome?.runtime;
}

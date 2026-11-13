import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from '@guchho/test';
import { Window } from 'happy-dom';

import {
  createContentScriptContext,
  createIframeUi,
  createIntegratedUi,
  createShadowRootUi,
} from '../../src/content/index.ts';
import {
  installFakeBrowser,
  uninstallFakeBrowser,
} from '../../src/testing/fake-browser.ts';

let window: Window;

beforeEach(() => {
  installFakeBrowser();
  window = new Window({ url: 'https://example.com/' });
  const scope = globalThis as Record<string, unknown>;
  scope.window = window;
  scope.document = window.document;
  scope.MutationObserver = window.MutationObserver;
  window.document.body.innerHTML = '<main id="anchor"></main>';
});

afterEach(() => {
  uninstallFakeBrowser();
  const scope = globalThis as Record<string, unknown>;
  delete scope.window;
  delete scope.document;
  delete scope.MutationObserver;
  window.close();
});

describe('content script UI', () => {
  it('mounts and removes an integrated UI', async () => {
    const context = createContentScriptContext({
      validateRuntime: false,
    });
    let removed = 0;
    const ui = createIntegratedUi<HTMLParagraphElement>(context, {
      anchor: '#anchor',
      onMount(container) {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'hello';
        container.append(paragraph);

        return paragraph;
      },
      onRemove() {
        removed += 1;
      },
    });

    const mounted = await ui.mount();
    expect(mounted.textContent).toBe('hello');
    expect(document.querySelector('#anchor p')?.textContent).toBe('hello');
    expect(ui.element?.isConnected).toBe(true);

    ui.remove();
    expect(document.querySelector('#anchor p')).toBeNull();
    expect(removed).toBe(1);

    ui.remove();
    expect(removed).toBe(1);
    context.invalidate();
  });

  it('mounts inside a shadow root with CSS isolation', async () => {
    const context = createContentScriptContext({
      validateRuntime: false,
    });
    const ui = createShadowRootUi<HTMLDivElement>(context, {
      anchor: '#anchor',
      css: 'p { color: red; }',
      onMount(container) {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'shadow';
        container.append(paragraph);

        return paragraph;
      },
    });

    const mounted = await ui.mount();
    expect(mounted.textContent).toBe('shadow');
    expect(ui.shadow?.querySelector('style')?.textContent).toBe(
      'p { color: red; }',
    );
    expect(ui.shadow?.querySelector('p')?.textContent).toBe('shadow');

    ui.remove();
    context.invalidate();
  });

  it('creates iframe UIs with extension URLs', async () => {
    const context = createContentScriptContext({
      validateRuntime: false,
    });
    const ui = createIframeUi(context, {
      anchor: '#anchor',
      page: '/frame.html',
    });

    const iframe = await ui.mount();
    expect(iframe.src).toBe(
      'chrome-extension://fake-extension-id/frame.html',
    );
    expect(document.querySelector('iframe')?.src).toBe(iframe.src);

    ui.remove();
    context.invalidate();
  });

  it('auto-mounts when the anchor appears and removes when it leaves', async () => {
    const context = createContentScriptContext({
      validateRuntime: false,
    });
    const ui = createIntegratedUi(context, {
      anchor: '#dynamic',
      onMount(container) {
        container.textContent = 'dynamic';

        return container;
      },
    });
    const stop = ui.autoMount();

    await tick();
    expect(ui.mounted).toBeUndefined();

    const dynamic = document.createElement('section');
    dynamic.id = 'dynamic';
    document.body.append(dynamic);
    await tick();

    expect(ui.mounted).not.toBeUndefined();
    expect(document.querySelector('#dynamic [data-addonova-ui]')).not.toBeNull();

    dynamic.remove();
    await tick();

    expect(ui.mounted).toBeUndefined();
    stop();
    context.invalidate();
  });

  it('unmounts auto-mounted UIs when the context is invalidated', async () => {
    const context = createContentScriptContext({
      validateRuntime: false,
    });
    const ui = createIntegratedUi(context, {
      anchor: '#anchor',
      onMount(container) {
        return container;
      },
    });

    ui.autoMount();
    await tick();
    expect(ui.mounted).not.toBeUndefined();

    context.invalidate();
    expect(ui.mounted).toBeUndefined();
  });
});

function tick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

import { BrowserApiError } from '../shared/errors.ts';
import type {
  InjectionResult,
  InjectionTarget,
  ScriptInjection,
  ScriptingApi,
} from '../types/scripting.ts';
import type { TabsApi } from '../types/tabs.ts';

export interface InjectScriptOptions {
  readonly tabId?: number;
  readonly frameIds?: readonly number[];
  readonly allFrames?: boolean;
  readonly world?: 'ISOLATED' | 'MAIN' | string;
  readonly injectImmediately?: boolean;
}

export interface InjectScriptApis {
  readonly scripting: Pick<ScriptingApi, 'executeScript'>;
  readonly tabs: Pick<TabsApi, 'query'>;
}

export type InjectScript = (
  path: string | readonly string[],
  options?: InjectScriptOptions,
) => Promise<InjectionResult[]>;

export function createInjectScript(apis: InjectScriptApis): InjectScript {
  const findActiveTabId = async (): Promise<number> => {
    const [tab] = await apis.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id === undefined) {
      throw new BrowserApiError(
        'BROWSER_API_FAILED',
        'Could not resolve an active tab for script injection.',
        { api: 'tabs.query' },
      );
    }

    return tab.id;
  };

  const resolveTarget = async (
    options: InjectScriptOptions,
  ): Promise<InjectionTarget> => {
    const tabId = options.tabId ?? (await findActiveTabId());

    return {
      tabId,
      ...(options.frameIds === undefined
        ? {}
        : { frameIds: options.frameIds }),
      ...(options.allFrames === undefined
        ? {}
        : { allFrames: options.allFrames }),
    };
  };

  return async function injectScript(
    path: string | readonly string[],
    options: InjectScriptOptions = {},
  ): Promise<InjectionResult[]> {
    const target = await resolveTarget(options);
    const files = typeof path === 'string' ? [path] : [...path];
    const injection: ScriptInjection = {
      target,
      files,
      ...(options.world === undefined ? {} : { world: options.world }),
      ...(options.injectImmediately === undefined
        ? {}
        : { injectImmediately: options.injectImmediately }),
    };

    return apis.scripting.executeScript(injection);
  };
}

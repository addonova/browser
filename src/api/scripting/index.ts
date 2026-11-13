import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  CSSInjection,
  InjectionResult,
  ScriptInjection,
  ScriptingApi,
} from '../../types/scripting.ts';
import { callAsync } from '../helpers.ts';

export function createScriptingApi(
  adapter: BrowserAdapter,
): ScriptingApi {
  return {
    executeScript<
      Result = unknown,
      Args extends readonly unknown[] = readonly unknown[],
    >(
      injection: ScriptInjection<Args> | readonly ScriptInjection<Args>[],
    ): Promise<InjectionResult<Result>[]> {
      return callAsync<InjectionResult<Result>[]>(
        adapter,
        ['scripting', 'executeScript'],
        injection,
      );
    },
    insertCSS(
      injection: CSSInjection | readonly CSSInjection[],
    ): Promise<void> {
      return callAsync<void>(
        adapter,
        ['scripting', 'insertCSS'],
        injection,
      );
    },
    removeCSS(
      injection: CSSInjection | readonly CSSInjection[],
    ): Promise<void> {
      return callAsync<void>(
        adapter,
        ['scripting', 'removeCSS'],
        injection,
      );
    },
  };
}


export type {
  CSSInjection,
  InjectionResult,
  InjectionTarget,
  ScriptInjection,
  ScriptingApi,
} from '../../types/scripting.ts';

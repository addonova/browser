export interface InjectionTarget {
  readonly tabId: number;
  readonly frameIds?: readonly number[];
  readonly allFrames?: boolean;
}

export interface ScriptInjection<
  Args extends readonly unknown[] = readonly unknown[],
> {
  readonly target: InjectionTarget;
  readonly files?: readonly string[];
  readonly func?: (...args: Args) => unknown;
  readonly args?: Args;
  readonly world?: string;
  readonly injectImmediately?: boolean;
}

export interface CSSInjection {
  readonly target: InjectionTarget;
  readonly css?: string;
  readonly files?: readonly string[];
  readonly origin?: string;
}

export interface InjectionResult<Result = unknown> {
  readonly frameId: number;
  readonly result?: Result;
  readonly error?: string;
}

export interface ScriptingApi {
  executeScript<Result = unknown>(
    injection: ScriptInjection | readonly ScriptInjection[],
  ): Promise<InjectionResult<Result>[]>;
  insertCSS(injection: CSSInjection | readonly CSSInjection[]): Promise<void>;
  removeCSS(injection: CSSInjection | readonly CSSInjection[]): Promise<void>;
}

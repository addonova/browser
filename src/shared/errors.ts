export type BrowserApiErrorCode =
  | 'BROWSER_UNSUPPORTED_ENVIRONMENT'
  | 'BROWSER_UNSUPPORTED_API'
  | 'BROWSER_PERMISSION_DENIED'
  | 'BROWSER_API_FAILED'
  | 'BROWSER_INVALID_ARGUMENT';

export interface BrowserApiErrorOptions {
  api?: string;
  cause?: unknown;
}

export interface NormalizeBrowserApiErrorOptions {
  code?: BrowserApiErrorCode;
  api?: string;
}

export class BrowserApiError extends Error {
  readonly code: BrowserApiErrorCode;
  readonly api: string | undefined;

  constructor(
    code: BrowserApiErrorCode,
    message: string,
    options: BrowserApiErrorOptions = {},
  ) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = 'BrowserApiError';
    this.code = code;
    this.api = options.api;
  }
}

export function isBrowserApiError(value: unknown): value is BrowserApiError {
  return value instanceof BrowserApiError;
}

export function isPermissionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /permission|not allowed|denied|access/i.test(message);
}

export function normalizeBrowserApiError(
  error: unknown,
  options: NormalizeBrowserApiErrorOptions = {},
): BrowserApiError {
  if (isBrowserApiError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const code =
    options.code ??
    (isPermissionError(error)
      ? 'BROWSER_PERMISSION_DENIED'
      : 'BROWSER_API_FAILED');

  return new BrowserApiError(code, message, {
    ...(options.api === undefined ? {} : { api: options.api }),
    cause: error,
  });
}

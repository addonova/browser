import { BrowserApiError } from '../shared/errors.ts';
import type { I18nApi } from '../types/i18n.ts';

export type I18nSubstitutions = string | readonly string[];

export interface I18nHelperOptions {
  readonly fallbackToKey?: boolean;
}

export interface I18nHelper {
  readonly locale: string;
  t(messageName: string, substitutions?: I18nSubstitutions): string;
  raw(messageName: string, substitutions?: I18nSubstitutions): string;
}

export type I18nMessageApi = Pick<I18nApi, 'getMessage' | 'getUILanguage'>;

export function createI18nHelper(
  api?: I18nMessageApi,
  options: I18nHelperOptions = {},
): I18nHelper {
  const fallbackToKey = options.fallbackToKey ?? true;
  const resolvedApi = api ?? getGlobalI18n();

  const raw = (
    messageName: string,
    substitutions?: I18nSubstitutions,
  ): string =>
    substitutions === undefined
      ? resolvedApi.getMessage(messageName)
      : resolvedApi.getMessage(messageName, substitutions);

  return {
    get locale(): string {
      return resolvedApi.getUILanguage();
    },
    t(messageName: string, substitutions?: I18nSubstitutions): string {
      const message = raw(messageName, substitutions);

      return message === '' && fallbackToKey ? messageName : message;
    },
    raw,
  };
}

export function formatMessage(
  message: string,
  substitutions?: I18nSubstitutions,
): string {
  if (substitutions === undefined) {
    return message;
  }

  const values =
    typeof substitutions === 'string' ? [substitutions] : substitutions;
  let result = message.replace(/\$\$/g, '\u0000');

  values.forEach((value, index) => {
    result = result.replaceAll(`$${index + 1}`, value);
  });

  return result.replace(/\u0000/g, '$');
}

export const i18nHelper: I18nHelper = {
  get locale(): string {
    return createI18nHelper().locale;
  },
  t(messageName, substitutions): string {
    return createI18nHelper().t(messageName, substitutions);
  },
  raw(messageName, substitutions): string {
    return createI18nHelper().raw(messageName, substitutions);
  },
};

export function t(
  messageName: string,
  substitutions?: I18nSubstitutions,
): string {
  return createI18nHelper().t(messageName, substitutions);
}

function getGlobalI18n(): I18nMessageApi {
  const global = globalThis as {
    browser?: { readonly i18n?: I18nMessageApi };
    chrome?: { readonly i18n?: I18nMessageApi };
  };
  const api = global.browser?.i18n ?? global.chrome?.i18n;

  if (api === undefined) {
    throw new BrowserApiError(
      'BROWSER_UNSUPPORTED_ENVIRONMENT',
      'The i18n API is not available in this environment.',
      { api: 'i18n.getMessage' },
    );
  }

  return api;
}

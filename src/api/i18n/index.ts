import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  I18nApi,
  LanguageDetectionResult,
} from '../../types/i18n.ts';
import { callAsync, callSync } from '../helpers.ts';

export function createI18nApi(adapter: BrowserAdapter): I18nApi {
  return {
    getMessage(
      messageName: string,
      substitutions?: string | readonly string[],
    ): string {
      return substitutions === undefined
        ? callSync<string>(adapter, ['i18n', 'getMessage'], messageName)
        : callSync<string>(
            adapter,
            ['i18n', 'getMessage'],
            messageName,
            substitutions,
          );
    },
    getUILanguage(): string {
      return callSync<string>(adapter, ['i18n', 'getUILanguage']);
    },
    detectLanguage(text: string): Promise<LanguageDetectionResult> {
      return callAsync<LanguageDetectionResult>(
        adapter,
        ['i18n', 'detectLanguage'],
        text,
      );
    },
  };
}


export type {
  DetectedLanguage,
  I18nApi,
  LanguageDetectionResult,
} from '../../types/i18n.ts';

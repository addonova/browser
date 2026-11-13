import { describe, expect, it } from '@guchho/test';

import {
  createI18nHelper,
  formatMessage,
} from '../../src/i18n/index.ts';

describe('i18n helpers', () => {
  it('formats numeric substitutions', () => {
    expect(formatMessage('Hello $1, you have $2 items.', ['Ada', '3'])).toBe(
      'Hello Ada, you have 3 items.',
    );
    expect(formatMessage('Welcome $1', 'Ada')).toBe('Welcome Ada');
  });

  it('falls back to message keys for missing messages', () => {
    const messages: Record<string, string> = {
      greeting: 'Hello $1',
    };
    const helper = createI18nHelper({
      getMessage(name, substitutions) {
        const message = messages[name] ?? '';

        return typeof substitutions === 'undefined'
          ? message
          : formatMessage(message, substitutions);
      },
      getUILanguage: () => 'en-US',
    });

    expect(helper.t('greeting', 'Ada')).toBe('Hello Ada');
    expect(helper.t('missing')).toBe('missing');
    expect(helper.raw('missing')).toBe('');
    expect(helper.locale).toBe('en-US');
  });

  it('can disable key fallbacks', () => {
    const helper = createI18nHelper(
      {
        getMessage: () => '',
        getUILanguage: () => 'fr',
      },
      { fallbackToKey: false },
    );

    expect(helper.t('missing')).toBe('');
  });
});

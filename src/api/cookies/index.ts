import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Cookie,
  CookieDetails,
  CookieGetAllDetails,
  CookiesApi,
  CookieSetDetails,
} from '../../types/cookies.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createCookiesApi(adapter: BrowserAdapter): CookiesApi {
  return {
    get(details: CookieDetails): Promise<Cookie | null> {
      return callAsync<Cookie | null>(
        adapter,
        ['cookies', 'get'],
        details,
      );
    },
    getAll(details: CookieGetAllDetails): Promise<Cookie[]> {
      return callAsync<Cookie[]>(
        adapter,
        ['cookies', 'getAll'],
        details,
      );
    },
    set(details: CookieSetDetails): Promise<Cookie | null> {
      return callAsync<Cookie | null>(
        adapter,
        ['cookies', 'set'],
        details,
      );
    },
    remove(details: CookieDetails): Promise<Cookie | null> {
      return callAsync<Cookie | null>(
        adapter,
        ['cookies', 'remove'],
        details,
      );
    },
    get onChanged() {
      return requireEvent<
        CookiesApi['onChanged']
      >(adapter, ['cookies', 'onChanged']);
    },
  };
}


export type {
  Cookie,
  CookieChangeInfo,
  CookieDetails,
  CookieGetAllDetails,
  CookiesApi,
  CookieSameSite,
  CookieSetDetails,
} from '../../types/cookies.ts';

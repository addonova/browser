import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Session,
  SessionsApi,
  SessionsFilter,
} from '../../types/sessions.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createSessionsApi(
  adapter: BrowserAdapter,
): SessionsApi {
  return {
    getRecentlyClosed(
      filter?: SessionsFilter,
    ): Promise<Session[]> {
      return filter === undefined
        ? callAsync<Session[]>(
            adapter,
            ['sessions', 'getRecentlyClosed'],
          )
        : callAsync<Session[]>(
            adapter,
            ['sessions', 'getRecentlyClosed'],
            filter,
          );
    },
    restore(sessionId?: string): Promise<Session> {
      return sessionId === undefined
        ? callAsync<Session>(adapter, ['sessions', 'restore'])
        : callAsync<Session>(
            adapter,
            ['sessions', 'restore'],
            sessionId,
          );
    },
    get onChanged() {
      return requireEvent<
        SessionsApi['onChanged']
      >(adapter, ['sessions', 'onChanged']);
    },
  };
}


export type {
  Session,
  SessionsApi,
  SessionsFilter,
  SessionTab,
  SessionWindow,
} from '../../types/sessions.ts';

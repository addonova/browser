import type { BrowserEvent } from '../shared/events.ts';

export interface SessionTab {
  readonly id?: number;
  readonly url?: string;
  readonly title?: string;
  readonly sessionId?: string;
  readonly [key: string]: unknown;
}

export interface SessionWindow {
  readonly id?: number;
  readonly tabs?: readonly SessionTab[];
  readonly [key: string]: unknown;
}

export interface Session {
  readonly lastModified: number;
  readonly tab?: SessionTab;
  readonly window?: SessionWindow;
}

export interface SessionsFilter {
  readonly maxResults?: number;
  readonly since?: number;
}

export interface SessionsApi {
  getRecentlyClosed(filter?: SessionsFilter): Promise<Session[]>;
  restore(sessionId?: string): Promise<Session>;
  readonly onChanged: BrowserEvent<() => void>;
}

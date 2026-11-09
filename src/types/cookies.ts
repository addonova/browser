import type { BrowserEvent } from '../shared/events.ts';

export type CookieSameSite =
  | 'no_restriction'
  | 'lax'
  | 'strict'
  | 'unspecified'
  | string;

export interface Cookie {
  readonly name: string;
  readonly value: string;
  readonly domain: string;
  readonly hostOnly: boolean;
  readonly path: string;
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly session: boolean;
  readonly sameSite: CookieSameSite;
  readonly expirationDate?: number;
  readonly storeId?: string;
  readonly partitionKey?: Readonly<Record<string, unknown>>;
  readonly [key: string]: unknown;
}

export interface CookieDetails {
  readonly url: string;
  readonly name?: string;
  readonly storeId?: string;
  readonly partitionKey?: Readonly<Record<string, unknown>>;
}

export interface CookieGetAllDetails {
  readonly url?: string;
  readonly domain?: string;
  readonly name?: string;
  readonly path?: string;
  readonly secure?: boolean;
  readonly session?: boolean;
  readonly storeId?: string;
}

export interface CookieSetDetails extends CookieDetails {
  readonly value: string;
  readonly domain?: string;
  readonly path?: string;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  readonly expirationDate?: number;
  readonly sameSite?: CookieSameSite;
}

export interface CookieChangeInfo {
  readonly removed: boolean;
  readonly cookie: Cookie;
  readonly cause: string;
}

export interface CookiesApi {
  get(details: CookieDetails): Promise<Cookie | null>;
  getAll(details: CookieGetAllDetails): Promise<Cookie[]>;
  set(details: CookieSetDetails): Promise<Cookie | null>;
  remove(details: CookieDetails): Promise<Cookie | null>;
  readonly onChanged: BrowserEvent<
    (changeInfo: CookieChangeInfo) => void
  >;
}

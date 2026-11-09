import type { BrowserEvent } from '../shared/events.ts';

export interface WebRequestDetails {
  readonly requestId: string;
  readonly url: string;
  readonly method: string;
  readonly tabId: number;
  readonly type: string;
  readonly timeStamp: number;
  readonly [key: string]: unknown;
}

export interface WebRequestApi {
  readonly onBeforeRequest: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
  readonly onBeforeSendHeaders: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
  readonly onSendHeaders: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
  readonly onHeadersReceived: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
  readonly onResponseStarted: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
  readonly onCompleted: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
  readonly onErrorOccurred: BrowserEvent<
    (details: WebRequestDetails) => void
  >;
}

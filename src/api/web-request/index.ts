import type { BrowserAdapter } from '../../adapters/types.ts';
import type { WebRequestApi } from '../../types/web-request.ts';
import { requireEvent } from '../helpers.ts';

export function createWebRequestApi(
  adapter: BrowserAdapter,
): WebRequestApi {
  return {
    get onBeforeRequest() {
      return requireEvent<
        WebRequestApi['onBeforeRequest']
      >(adapter, ['webRequest', 'onBeforeRequest']);
    },
    get onBeforeSendHeaders() {
      return requireEvent<
        WebRequestApi['onBeforeSendHeaders']
      >(adapter, ['webRequest', 'onBeforeSendHeaders']);
    },
    get onSendHeaders() {
      return requireEvent<
        WebRequestApi['onSendHeaders']
      >(adapter, ['webRequest', 'onSendHeaders']);
    },
    get onHeadersReceived() {
      return requireEvent<
        WebRequestApi['onHeadersReceived']
      >(adapter, ['webRequest', 'onHeadersReceived']);
    },
    get onResponseStarted() {
      return requireEvent<
        WebRequestApi['onResponseStarted']
      >(adapter, ['webRequest', 'onResponseStarted']);
    },
    get onCompleted() {
      return requireEvent<
        WebRequestApi['onCompleted']
      >(adapter, ['webRequest', 'onCompleted']);
    },
    get onErrorOccurred() {
      return requireEvent<
        WebRequestApi['onErrorOccurred']
      >(adapter, ['webRequest', 'onErrorOccurred']);
    },
  };
}


export type {
  WebRequestApi,
  WebRequestDetails,
} from '../../types/web-request.ts';

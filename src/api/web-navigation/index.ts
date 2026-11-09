import type { BrowserAdapter } from '../../adapters/types.ts';
import type { WebNavigationApi } from '../../types/web-navigation.ts';
import { requireEvent } from '../helpers.ts';

export function createWebNavigationApi(
  adapter: BrowserAdapter,
): WebNavigationApi {
  return {
    get onBeforeNavigate() {
      return requireEvent<
        WebNavigationApi['onBeforeNavigate']
      >(adapter, ['webNavigation', 'onBeforeNavigate']);
    },
    get onCommitted() {
      return requireEvent<
        WebNavigationApi['onCommitted']
      >(adapter, ['webNavigation', 'onCommitted']);
    },
    get onDOMContentLoaded() {
      return requireEvent<
        WebNavigationApi['onDOMContentLoaded']
      >(adapter, ['webNavigation', 'onDOMContentLoaded']);
    },
    get onCompleted() {
      return requireEvent<
        WebNavigationApi['onCompleted']
      >(adapter, ['webNavigation', 'onCompleted']);
    },
    get onErrorOccurred() {
      return requireEvent<
        WebNavigationApi['onErrorOccurred']
      >(adapter, ['webNavigation', 'onErrorOccurred']);
    },
    get onCreatedNavigationTarget() {
      return requireEvent<
        WebNavigationApi['onCreatedNavigationTarget']
      >(adapter, ['webNavigation', 'onCreatedNavigationTarget']);
    },
    get onReferenceFragmentUpdated() {
      return requireEvent<
        WebNavigationApi['onReferenceFragmentUpdated']
      >(adapter, ['webNavigation', 'onReferenceFragmentUpdated']);
    },
    get onHistoryStateUpdated() {
      return requireEvent<
        WebNavigationApi['onHistoryStateUpdated']
      >(adapter, ['webNavigation', 'onHistoryStateUpdated']);
    },
  };
}


export type {
  NavigationDetails,
  NavigationErrorDetails,
  WebNavigationApi,
} from '../../types/web-navigation.ts';

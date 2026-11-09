import type { BrowserEvent } from '../shared/events.ts';

export interface NavigationDetails {
  readonly tabId: number;
  readonly frameId: number;
  readonly url: string;
  readonly processId?: number;
  readonly timeStamp: number;
  readonly [key: string]: unknown;
}

export interface NavigationErrorDetails extends NavigationDetails {
  readonly error: string;
}

export interface WebNavigationApi {
  readonly onBeforeNavigate: BrowserEvent<
    (
      details: NavigationDetails & { readonly parentFrameId?: number },
    ) => void
  >;
  readonly onCommitted: BrowserEvent<
    (
      details: NavigationDetails & {
        readonly transitionType: string;
        readonly transitionQualifiers?: readonly string[];
      },
    ) => void
  >;
  readonly onDOMContentLoaded: BrowserEvent<
    (details: NavigationDetails) => void
  >;
  readonly onCompleted: BrowserEvent<
    (details: NavigationDetails) => void
  >;
  readonly onErrorOccurred: BrowserEvent<
    (details: NavigationErrorDetails) => void
  >;
  readonly onCreatedNavigationTarget: BrowserEvent<
    (details: Readonly<Record<string, unknown>>) => void
  >;
  readonly onReferenceFragmentUpdated: BrowserEvent<
    (details: NavigationDetails) => void
  >;
  readonly onHistoryStateUpdated: BrowserEvent<
    (details: NavigationDetails) => void
  >;
}

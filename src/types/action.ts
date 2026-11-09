import type { BrowserEvent } from '../shared/events.ts';
import type { Tab } from './tabs.ts';

export type ActionArea = 'action' | 'browserAction' | 'pageAction';

export type ColorValue =
  | string
  | readonly [number, number, number, number];

export type IconPath = string | Readonly<Record<string, string>>;

export type IconImageData =
  | ImageData
  | Readonly<Record<number, ImageData>>;

export interface TabDetails {
  readonly tabId?: number;
}

export interface SetBadgeTextDetails extends TabDetails {
  readonly text: string;
}

export interface SetBadgeBackgroundColorDetails extends TabDetails {
  readonly color: ColorValue;
}

export interface SetTitleDetails extends TabDetails {
  readonly title: string;
}

export interface SetIconDetails extends TabDetails {
  readonly path?: IconPath;
  readonly imageData?: IconImageData;
}

export interface OpenPopupOptions {
  readonly windowId?: number;
}

export interface ActionApi {
  readonly area: ActionArea | null;
  setBadgeText(details: SetBadgeTextDetails): Promise<void>;
  setBadgeBackgroundColor(
    details: SetBadgeBackgroundColorDetails,
  ): Promise<void>;
  setTitle(details: SetTitleDetails): Promise<void>;
  setIcon(details: SetIconDetails): Promise<void>;
  openPopup(options?: OpenPopupOptions): Promise<void>;
  readonly onClicked: BrowserEvent<(tab: Tab) => void>;
}

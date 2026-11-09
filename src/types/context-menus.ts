import type { BrowserEvent } from '../shared/events.ts';
import type { Tab } from './tabs.ts';

export interface ContextMenuOnClickData {
  readonly menuItemId: string | number;
  readonly parentMenuItemId?: string | number;
  readonly linkUrl?: string;
  readonly srcUrl?: string;
  readonly pageUrl?: string;
  readonly frameId?: number;
  readonly selectionText?: string;
  readonly editable: boolean;
  readonly wasChecked?: boolean;
  readonly checked?: boolean;
  readonly [key: string]: unknown;
}

export interface ContextMenuCreateProperties {
  readonly id?: string;
  readonly title?: string;
  readonly type?: string;
  readonly contexts?: readonly string[];
  readonly parentId?: string | number;
  readonly documentUrlPatterns?: readonly string[];
  readonly targetUrlPatterns?: readonly string[];
  readonly enabled?: boolean;
  readonly visible?: boolean;
  readonly checked?: boolean;
  readonly [key: string]: unknown;
}

export interface ContextMenuUpdateProperties {
  readonly title?: string;
  readonly type?: string;
  readonly contexts?: readonly string[];
  readonly parentId?: string | number;
  readonly documentUrlPatterns?: readonly string[];
  readonly targetUrlPatterns?: readonly string[];
  readonly enabled?: boolean;
  readonly visible?: boolean;
  readonly checked?: boolean;
  readonly [key: string]: unknown;
}

export interface ContextMenusApi {
  create(createProperties: ContextMenuCreateProperties): string | number;
  update(
    id: string | number,
    updateProperties: ContextMenuUpdateProperties,
  ): Promise<void>;
  remove(id: string | number): Promise<void>;
  removeAll(): Promise<void>;
  readonly onClicked: BrowserEvent<
    (info: ContextMenuOnClickData, tab?: Tab) => void
  >;
}

import type { BrowserEvent } from '../shared/events.ts';

export interface NotificationButton {
  readonly title: string;
  readonly iconUrl?: string;
}

export interface NotificationItem {
  readonly title: string;
  readonly message: string;
}

export interface NotificationOptions {
  readonly type?: string;
  readonly iconUrl: string;
  readonly title: string;
  readonly message: string;
  readonly contextMessage?: string;
  readonly priority?: number;
  readonly eventTime?: number;
  readonly buttons?: readonly NotificationButton[];
  readonly imageUrl?: string;
  readonly items?: readonly NotificationItem[];
  readonly progress?: number;
  readonly requireInteraction?: boolean;
  readonly silent?: boolean;
  readonly [key: string]: unknown;
}

export interface NotificationsApi {
  create(options: NotificationOptions): Promise<string>;
  update(
    notificationId: string,
    options: NotificationOptions,
  ): Promise<boolean>;
  clear(notificationId: string): Promise<boolean>;
  getAll(): Promise<Record<string, boolean>>;
  readonly onClicked: BrowserEvent<(notificationId: string) => void>;
  readonly onClosed: BrowserEvent<
    (notificationId: string, byUser: boolean) => void
  >;
  readonly onButtonClicked: BrowserEvent<
    (notificationId: string, buttonIndex: number) => void
  >;
}

import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  NotificationOptions,
  NotificationsApi,
} from '../../types/notifications.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createNotificationsApi(
  adapter: BrowserAdapter,
): NotificationsApi {
  return {
    create(options: NotificationOptions): Promise<string> {
      return callAsync<string>(
        adapter,
        ['notifications', 'create'],
        options,
      );
    },
    update(
      notificationId: string,
      options: NotificationOptions,
    ): Promise<boolean> {
      return callAsync<boolean>(
        adapter,
        ['notifications', 'update'],
        notificationId,
        options,
      );
    },
    clear(notificationId: string): Promise<boolean> {
      return callAsync<boolean>(
        adapter,
        ['notifications', 'clear'],
        notificationId,
      );
    },
    getAll(): Promise<Record<string, boolean>> {
      return callAsync<Record<string, boolean>>(
        adapter,
        ['notifications', 'getAll'],
      );
    },
    get onClicked() {
      return requireEvent<
        NotificationsApi['onClicked']
      >(adapter, ['notifications', 'onClicked']);
    },
    get onClosed() {
      return requireEvent<
        NotificationsApi['onClosed']
      >(adapter, ['notifications', 'onClosed']);
    },
    get onButtonClicked() {
      return requireEvent<
        NotificationsApi['onButtonClicked']
      >(adapter, ['notifications', 'onButtonClicked']);
    },
  };
}


export type {
  NotificationButton,
  NotificationItem,
  NotificationOptions,
  NotificationsApi,
} from '../../types/notifications.ts';

import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Tab,
  TabCreateProperties,
  TabQueryInfo,
  TabReloadProperties,
  TabsApi,
  TabsQuery,
  TabUpdateProperties,
} from '../../types/tabs.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createTabsApi(adapter: BrowserAdapter): TabsApi {
  return {
    query(queryInfo?: TabsQuery): Promise<Tab[]> {
      return queryInfo === undefined
        ? callAsync<Tab[]>(adapter, ['tabs', 'query'])
        : callAsync<Tab[]>(adapter, ['tabs', 'query'], queryInfo);
    },
    get(tabId: number): Promise<Tab> {
      return callAsync<Tab>(adapter, ['tabs', 'get'], tabId);
    },
    create(createProperties: TabCreateProperties): Promise<Tab> {
      return callAsync<Tab>(
        adapter,
        ['tabs', 'create'],
        createProperties,
      );
    },
    update(
      tabId: number,
      updateProperties: TabUpdateProperties,
    ): Promise<Tab> {
      return callAsync<Tab>(
        adapter,
        ['tabs', 'update'],
        tabId,
        updateProperties,
      );
    },
    remove(tabIds: number | readonly number[]): Promise<void> {
      return callAsync<void>(adapter, ['tabs', 'remove'], tabIds);
    },
    reload(
      tabId?: number,
      reloadProperties?: TabReloadProperties,
    ): Promise<void> {
      const target = ['tabs', 'reload'] as const;

      if (reloadProperties === undefined) {
        return tabId === undefined
          ? callAsync<void>(adapter, target)
          : callAsync<void>(adapter, target, tabId);
      }

      return callAsync<void>(
        adapter,
        target,
        tabId,
        reloadProperties,
      );
    },
    sendMessage<T = unknown>(
      tabId: number,
      message: unknown,
      options?: TabQueryInfo,
    ): Promise<T> {
      return options === undefined
        ? callAsync<T>(
            adapter,
            ['tabs', 'sendMessage'],
            tabId,
            message,
          )
        : callAsync<T>(
            adapter,
            ['tabs', 'sendMessage'],
            tabId,
            message,
            options,
          );
    },
    get onCreated() {
      return requireEvent<
        TabsApi['onCreated']
      >(adapter, ['tabs', 'onCreated']);
    },
    get onUpdated() {
      return requireEvent<
        TabsApi['onUpdated']
      >(adapter, ['tabs', 'onUpdated']);
    },
    get onRemoved() {
      return requireEvent<
        TabsApi['onRemoved']
      >(adapter, ['tabs', 'onRemoved']);
    },
    get onActivated() {
      return requireEvent<
        TabsApi['onActivated']
      >(adapter, ['tabs', 'onActivated']);
    },
  };
}


export type {
  MutedInfo,
  Tab,
  TabCreateProperties,
  TabQueryInfo,
  TabReloadProperties,
  TabsApi,
  TabsQuery,
  TabUpdateProperties,
} from '../../types/tabs.ts';

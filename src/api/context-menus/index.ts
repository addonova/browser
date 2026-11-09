import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  ContextMenuCreateProperties,
  ContextMenusApi,
  ContextMenuUpdateProperties,
} from '../../types/context-menus.ts';
import {
  callAsync,
  callSync,
  requireEvent,
} from '../helpers.ts';

export function createContextMenusApi(
  adapter: BrowserAdapter,
): ContextMenusApi {
  return {
    create(createProperties: ContextMenuCreateProperties): string | number {
      return callSync<string | number>(
        adapter,
        ['contextMenus', 'create'],
        createProperties,
      );
    },
    update(
      id: string | number,
      updateProperties: ContextMenuUpdateProperties,
    ): Promise<void> {
      return callAsync<void>(
        adapter,
        ['contextMenus', 'update'],
        id,
        updateProperties,
      );
    },
    remove(id: string | number): Promise<void> {
      return callAsync<void>(
        adapter,
        ['contextMenus', 'remove'],
        id,
      );
    },
    removeAll(): Promise<void> {
      return callAsync<void>(
        adapter,
        ['contextMenus', 'removeAll'],
      );
    },
    get onClicked() {
      return requireEvent<
        ContextMenusApi['onClicked']
      >(adapter, ['contextMenus', 'onClicked']);
    },
  };
}


export type {
  ContextMenuCreateProperties,
  ContextMenuOnClickData,
  ContextMenusApi,
  ContextMenuUpdateProperties,
} from '../../types/context-menus.ts';

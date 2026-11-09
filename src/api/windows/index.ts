import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Window,
  WindowCreateProperties,
  WindowGetInfo,
  WindowsApi,
  WindowUpdateProperties,
} from '../../types/windows.ts';
import { callAsync } from '../helpers.ts';

export function createWindowsApi(adapter: BrowserAdapter): WindowsApi {
  return {
    getCurrent(getInfo?: WindowGetInfo): Promise<Window> {
      return getInfo === undefined
        ? callAsync<Window>(adapter, ['windows', 'getCurrent'])
        : callAsync<Window>(
            adapter,
            ['windows', 'getCurrent'],
            getInfo,
          );
    },
    create(createData?: WindowCreateProperties): Promise<Window> {
      return createData === undefined
        ? callAsync<Window>(adapter, ['windows', 'create'])
        : callAsync<Window>(
            adapter,
            ['windows', 'create'],
            createData,
          );
    },
    update(
      windowId: number,
      updateInfo: WindowUpdateProperties,
    ): Promise<Window> {
      return callAsync<Window>(
        adapter,
        ['windows', 'update'],
        windowId,
        updateInfo,
      );
    },
    remove(windowId: number): Promise<void> {
      return callAsync<void>(
        adapter,
        ['windows', 'remove'],
        windowId,
      );
    },
    getAll(getInfo?: WindowGetInfo): Promise<Window[]> {
      return getInfo === undefined
        ? callAsync<Window[]>(adapter, ['windows', 'getAll'])
        : callAsync<Window[]>(
            adapter,
            ['windows', 'getAll'],
            getInfo,
          );
    },
  };
}


export type {
  Window,
  WindowCreateProperties,
  WindowGetInfo,
  WindowsApi,
  WindowUpdateProperties,
} from '../../types/windows.ts';

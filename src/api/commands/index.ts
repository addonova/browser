import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Command,
  CommandsApi,
} from '../../types/commands.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createCommandsApi(
  adapter: BrowserAdapter,
): CommandsApi {
  return {
    getAll(): Promise<Command[]> {
      return callAsync<Command[]>(adapter, ['commands', 'getAll']);
    },
    get onCommand() {
      return requireEvent<
        CommandsApi['onCommand']
      >(adapter, ['commands', 'onCommand']);
    },
  };
}


export type {
  Command,
  CommandsApi,
} from '../../types/commands.ts';

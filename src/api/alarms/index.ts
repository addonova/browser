import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  Alarm,
  AlarmCreateInfo,
  AlarmsApi,
} from '../../types/alarms.ts';
import {
  callAsync,
  callVoid,
  requireEvent,
} from '../helpers.ts';

export function createAlarmsApi(adapter: BrowserAdapter): AlarmsApi {
  return {
    create(
      nameOrInfo: string | AlarmCreateInfo,
      info?: AlarmCreateInfo,
    ): Promise<void> {
      const target = ['alarms', 'create'] as const;

      if (typeof nameOrInfo === 'string') {
        return info === undefined
          ? callVoid(adapter, target, nameOrInfo, {})
          : callVoid(adapter, target, nameOrInfo, info);
      }

      return callVoid(adapter, target, nameOrInfo);
    },
    get(name?: string): Promise<Alarm | undefined> {
      return name === undefined
        ? callAsync<Alarm | undefined>(adapter, ['alarms', 'get'])
        : callAsync<Alarm | undefined>(
            adapter,
            ['alarms', 'get'],
            name,
          );
    },
    getAll(): Promise<Alarm[]> {
      return callAsync<Alarm[]>(adapter, ['alarms', 'getAll']);
    },
    clear(name?: string): Promise<boolean> {
      return name === undefined
        ? callAsync<boolean>(adapter, ['alarms', 'clear'])
        : callAsync<boolean>(adapter, ['alarms', 'clear'], name);
    },
    clearAll(): Promise<boolean> {
      return callAsync<boolean>(adapter, ['alarms', 'clearAll']);
    },
    get onAlarm() {
      return requireEvent<
        AlarmsApi['onAlarm']
      >(adapter, ['alarms', 'onAlarm']);
    },
  };
}


export type {
  Alarm,
  AlarmCreateInfo,
  AlarmsApi,
} from '../../types/alarms.ts';

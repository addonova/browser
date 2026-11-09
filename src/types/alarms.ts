import type { BrowserEvent } from '../shared/events.ts';

export interface Alarm {
  readonly name: string;
  readonly scheduledTime: number;
  readonly periodInMinutes?: number;
}

export interface AlarmCreateInfo {
  readonly when?: number;
  readonly delayInMinutes?: number;
  readonly periodInMinutes?: number;
}

export interface AlarmsApi {
  create(info: AlarmCreateInfo): Promise<void>;
  create(name: string, info: AlarmCreateInfo): Promise<void>;
  get(name?: string): Promise<Alarm | undefined>;
  getAll(): Promise<Alarm[]>;
  clear(name?: string): Promise<boolean>;
  clearAll(): Promise<boolean>;
  readonly onAlarm: BrowserEvent<(alarm: Alarm) => void>;
}

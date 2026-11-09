import type { BrowserEvent } from '../shared/events.ts';

export interface Command {
  readonly name?: string;
  readonly description?: string;
  readonly shortcut?: string;
}

export interface CommandsApi {
  getAll(): Promise<Command[]>;
  readonly onCommand: BrowserEvent<(command: string) => void>;
}

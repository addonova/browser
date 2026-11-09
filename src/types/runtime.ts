import type { BrowserEvent } from '../shared/events.ts';
import type { Tab } from './tabs.ts';

export interface MessageSender {
  readonly id?: string;
  readonly url?: string;
  readonly origin?: string;
  readonly tab?: Tab;
  readonly frameId?: number;
  readonly documentId?: string;
  readonly documentLifecycle?: string;
  readonly tlsChannelId?: string;
  readonly contextId?: number;
}

export interface MessageOptions {
  readonly includeTlsChannelId?: boolean;
}

export type SendResponse = (response?: unknown) => void;

export interface Port {
  readonly name: string;
  readonly sender?: MessageSender;
  readonly error?: Error;
  postMessage(message: unknown): void;
  disconnect(): void;
  readonly onMessage: BrowserEvent<(message: unknown, port: Port) => void>;
  readonly onDisconnect: BrowserEvent<(port: Port) => void>;
}

export interface ConnectInfo {
  readonly name?: string;
  readonly includeTlsChannelId?: boolean;
}

export interface InstallDetails {
  readonly reason: string;
  readonly previousVersion?: string;
  readonly temporary?: boolean;
}

export interface RuntimeLastError {
  readonly message?: string;
}

export interface Manifest {
  readonly manifest_version?: number;
  readonly name?: string;
  readonly version?: string;
  readonly permissions?: readonly string[];
  readonly host_permissions?: readonly string[];
  [key: string]: unknown;
}

export interface RuntimeApi {
  readonly id: string;
  getManifest<T = Manifest>(): T;
  getURL(path: string): string;
  sendMessage<T = unknown>(
    message: unknown,
    options?: MessageOptions,
  ): Promise<T>;
  connect(connectInfo?: ConnectInfo): Port;
  readonly onMessage: BrowserEvent<
    (
      message: unknown,
      sender: MessageSender,
      sendResponse: SendResponse,
    ) => boolean | void
  >;
  readonly onInstalled: BrowserEvent<(details: InstallDetails) => void>;
  readonly onStartup: BrowserEvent<() => void>;
  readonly onSuspend: BrowserEvent<() => void>;
}

import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  ConnectInfo,
  Manifest,
  MessageOptions,
  Port,
  RuntimeApi,
} from '../../types/runtime.ts';
import {
  callAsync,
  callSync,
  requireEvent,
  requireNamespace,
} from '../helpers.ts';

export function createRuntimeApi(adapter: BrowserAdapter): RuntimeApi {
  return {
    get id() {
      const runtime = requireNamespace<{ readonly id?: unknown }>(
        adapter,
        'runtime',
      );

      return typeof runtime.id === 'string' ? runtime.id : '';
    },
    getManifest<T = Manifest>(): T {
      return callSync<T>(adapter, ['runtime', 'getManifest']);
    },
    getURL(path: string): string {
      return callSync<string>(adapter, ['runtime', 'getURL'], path);
    },
    sendMessage<T = unknown>(
      message: unknown,
      options?: MessageOptions,
    ): Promise<T> {
      return options === undefined
        ? callAsync<T>(adapter, ['runtime', 'sendMessage'], message)
        : callAsync<T>(adapter, ['runtime', 'sendMessage'], message, options);
    },
    connect(connectInfo?: ConnectInfo): Port {
      return connectInfo === undefined
        ? callSync<Port>(adapter, ['runtime', 'connect'])
        : callSync<Port>(adapter, ['runtime', 'connect'], connectInfo);
    },
    get onMessage() {
      return requireEvent<
        RuntimeApi['onMessage']
      >(adapter, ['runtime', 'onMessage']);
    },
    get onInstalled() {
      return requireEvent<
        RuntimeApi['onInstalled']
      >(adapter, ['runtime', 'onInstalled']);
    },
    get onStartup() {
      return requireEvent<
        RuntimeApi['onStartup']
      >(adapter, ['runtime', 'onStartup']);
    },
    get onSuspend() {
      return requireEvent<
        RuntimeApi['onSuspend']
      >(adapter, ['runtime', 'onSuspend']);
    },
  };
}


export type {
  ConnectInfo,
  InstallDetails,
  Manifest,
  MessageOptions,
  MessageSender,
  Port,
  RuntimeApi,
  SendResponse,
} from '../../types/runtime.ts';

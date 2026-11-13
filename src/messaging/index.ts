import type { BrowserEvent } from '../shared/events.ts';
import type { MessageSender, SendResponse } from '../types/runtime.ts';
import { BrowserApiError, isBrowserApiError } from '../shared/errors.ts';
import type { BrowserApiErrorCode } from '../shared/errors.ts';

export interface MessagingRuntime {
  sendMessage<T = unknown>(message: unknown): Promise<T>;
  readonly onMessage: BrowserEvent<
    (
      message: unknown,
      sender: MessageSender,
      sendResponse: SendResponse,
    ) => boolean | void
  >;
}

const MESSAGE_KEY = '__addonova_message__';
const RESPONSE_KEY = '__addonova_message_response__';

export type MessageProtocol = object;

export type MessageKeys<P extends object> = Extract<keyof P, string>;

export type MessageData<P extends object, K extends MessageKeys<P>> =
  P[K] extends (...args: infer Args) => unknown
    ? Args extends readonly []
      ? undefined
      : Args[0]
    : never;

export type MessageReturn<P extends object, K extends MessageKeys<P>> =
  P[K] extends (...args: never[]) => infer Result ? Awaited<Result> : never;

export type MessageSendArgs<P extends object, K extends MessageKeys<P>> =
  P[K] extends (...args: infer Args) => unknown
    ? Args extends readonly []
      ? []
      : [data: Args[0]]
    : never;

export interface MessageContext<
  Data = unknown,
  Sender = MessageSender,
> {
  readonly data: Data;
  readonly sender: Sender;
}

export type MessageHandler<
  P extends object,
  K extends MessageKeys<P>,
  Sender = MessageSender,
> = (
  message: MessageContext<MessageData<P, K>, Sender>,
) => P[K] extends (...args: never[]) => infer Result
  ? Result | Promise<Result>
  : never;

export interface ExtensionMessenger<P extends object> {
  sendMessage<K extends MessageKeys<P>>(
    type: K,
    ...args: MessageSendArgs<P, K>
  ): Promise<MessageReturn<P, K>>;
  onMessage<K extends MessageKeys<P>>(
    type: K,
    handler: MessageHandler<P, K>,
  ): () => void;
}

interface MessageEnvelope {
  readonly [MESSAGE_KEY]: true;
  readonly type: string;
  readonly data?: unknown;
}

interface MessageResponse {
  readonly [RESPONSE_KEY]: true;
  readonly ok: boolean;
  readonly data?: unknown;
  readonly error?: SerializedMessageError;
}

interface SerializedMessageError {
  readonly name: string;
  readonly message: string;
  readonly code?: string;
  readonly stack?: string;
}

export function createExtensionMessaging<
  P extends object = Record<string, (data?: unknown) => unknown>,
>(runtime: MessagingRuntime): ExtensionMessenger<P> {
  return {
    async sendMessage<K extends MessageKeys<P>>(
      type: K,
      ...args: MessageSendArgs<P, K>
    ): Promise<MessageReturn<P, K>> {
      const messageArgs = args as readonly unknown[];
      const envelope: MessageEnvelope = {
        [MESSAGE_KEY]: true,
        type,
        ...(messageArgs.length === 0 ? {} : { data: messageArgs[0] }),
      };
      const response = await runtime.sendMessage<unknown>(envelope);

      if (!isMessageResponse(response)) {
        return response as MessageReturn<P, K>;
      }

      if (!response.ok) {
        throw deserializeError(response.error);
      }

      return response.data as MessageReturn<P, K>;
    },
    onMessage<K extends MessageKeys<P>>(
      type: K,
      handler: MessageHandler<P, K>,
    ): () => void {
      const listener = (
        message: unknown,
        sender: MessageSender,
        sendResponse: SendResponse,
      ): boolean => {
        if (!isMessageEnvelope(message) || message.type !== type) {
          return false;
        }

        void Promise.resolve(
          handler({
            data: message.data as MessageData<P, K>,
            sender,
          }),
        ).then(
          (data) => {
            sendResponse(successResponse(data));
          },
          (error: unknown) => {
            sendResponse(failureResponse(error));
          },
        );

        return true;
      };

      runtime.onMessage.addListener(listener);

      return () => runtime.onMessage.removeListener(listener);
    },
  };
}

function isMessageEnvelope(value: unknown): value is MessageEnvelope {
  return (
    isRecord(value) &&
    value[MESSAGE_KEY] === true &&
    typeof value.type === 'string'
  );
}

function isMessageResponse(value: unknown): value is MessageResponse {
  return isRecord(value) && value[RESPONSE_KEY] === true;
}

function successResponse(data: unknown): MessageResponse {
  return { [RESPONSE_KEY]: true, ok: true, data };
}

function failureResponse(error: unknown): MessageResponse {
  return {
    [RESPONSE_KEY]: true,
    ok: false,
    error: serializeError(error),
  };
}

function serializeError(error: unknown): SerializedMessageError {
  const name =
    error instanceof Error && error.name !== ''
      ? error.name
      : 'Error';
  const message =
    error instanceof Error ? error.message : String(error);

  return {
    name,
    message,
    ...(isBrowserApiError(error) ? { code: error.code } : {}),
    ...(error instanceof Error && error.stack !== undefined
      ? { stack: error.stack }
      : {}),
  };
}

function deserializeError(error: SerializedMessageError | undefined): Error {
  if (error === undefined) {
    return new BrowserApiError(
      'BROWSER_API_FAILED',
      'The message handler failed without an error.',
      { api: 'runtime.sendMessage' },
    );
  }

  if (error.code !== undefined && isBrowserApiErrorCode(error.code)) {
    return new BrowserApiError(error.code, error.message, {
      api: 'runtime.sendMessage',
    });
  }

  const result = new Error(error.message);
  result.name = error.name;

  if (error.stack !== undefined) {
    result.stack = error.stack;
  }

  return result;
}

function isBrowserApiErrorCode(value: string): value is BrowserApiErrorCode {
  return (
    value === 'BROWSER_UNSUPPORTED_ENVIRONMENT' ||
    value === 'BROWSER_UNSUPPORTED_API' ||
    value === 'BROWSER_PERMISSION_DENIED' ||
    value === 'BROWSER_API_FAILED' ||
    value === 'BROWSER_INVALID_ARGUMENT'
  );
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

import { BrowserApiError } from '../shared/errors.ts';
import type { ExtensionMessenger } from './index.ts';

const PROXY_PREFIX = '__addonova_proxy__:';

type ProxyProtocol = Record<
  string,
  (data: ProxyRequest) => unknown
>;

interface ProxyRequest {
  readonly method: string;
  readonly args: readonly unknown[];
}

export type AsyncService<Service extends object> = {
  [Key in keyof Service]: Service[Key] extends (
    ...args: infer Args
  ) => infer Result
    ? (...args: Args) => Promise<Awaited<Result>>
    : never;
};

export type ProxyServiceFactory<
  Service extends object,
  Args extends readonly unknown[],
> = (...args: Args) => Service;

export type ProxyServiceRegistration<
  Service extends object,
  Args extends readonly unknown[],
> = {
  (...args: Args): Service;
  readonly name: string;
  dispose(): void;
};

export type MessengerFactory = <
  P extends object = Record<string, (data?: unknown) => unknown>,
>() => ExtensionMessenger<P>;

export type DefineProxyService = <
  Service extends object,
  Args extends readonly unknown[] = readonly unknown[],
>(
  name: string,
  create: ProxyServiceFactory<Service, Args>,
) => [
  register: ProxyServiceRegistration<Service, Args>,
  get: () => AsyncService<Service>,
];

export function createProxyServices(
  createMessenger: MessengerFactory,
): DefineProxyService {
  const messaging = createMessenger<ProxyProtocol>();
  const services = new Map<string, object>();

  return function defineProxyService<
    Service extends object,
    Args extends readonly unknown[] = readonly unknown[],
  >(
    name: string,
    create: ProxyServiceFactory<Service, Args>,
  ): [
    register: ProxyServiceRegistration<Service, Args>,
    get: () => AsyncService<Service>,
  ] {
    const messageType = `${PROXY_PREFIX}${name}`;
    let dispose: (() => void) | undefined;

    const register = ((...args: Args): Service => {
      if (services.has(name)) {
        throw new BrowserApiError(
          'BROWSER_INVALID_ARGUMENT',
          `Proxy service "${name}" is already registered.`,
        );
      }

      const service = create(...args);
      services.set(name, service);

      const removeListener = messaging.onMessage(
        messageType,
        async ({ data }) => {
          if (!isProxyRequest(data)) {
            throw new BrowserApiError(
              'BROWSER_INVALID_ARGUMENT',
              `Invalid proxy request for service "${name}".`,
            );
          }

          const method = (service as Record<string, unknown>)[data.method];

          if (typeof method !== 'function') {
            throw new BrowserApiError(
              'BROWSER_UNSUPPORTED_API',
              `Proxy service "${name}" does not implement "${data.method}".`,
            );
          }

          return await (
            method as (...methodArgs: readonly unknown[]) => unknown
          ).apply(service, [...data.args]);
        },
      );

      dispose = () => {
        removeListener();
        services.delete(name);
        dispose = undefined;
      };

      return service;
    }) as ProxyServiceRegistration<Service, Args>;

    Object.defineProperty(register, 'name', { value: name });
    Object.defineProperty(register, 'dispose', {
      value: () => {
        dispose?.();
      },
    });

    const get = (): AsyncService<Service> => {
      const proxy = new Proxy(
        {},
        {
          get(_target, property): unknown {
            if (typeof property === 'symbol' || property === 'then') {
              return undefined;
            }

            return (...args: readonly unknown[]): Promise<unknown> =>
              messaging.sendMessage(messageType, {
                method: property,
                args,
              });
          },
        },
      );

      return proxy as AsyncService<Service>;
    };

    return [register, get];
  };
}

function isProxyRequest(value: unknown): value is ProxyRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { method?: unknown }).method === 'string' &&
    Array.isArray((value as { args?: unknown }).args)
  );
}

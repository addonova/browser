export {
  BrowserApiError,
  isBrowserApiError,
  isPermissionError,
  normalizeBrowserApiError,
} from '../shared/errors.ts';
export type {
  BrowserApiErrorCode,
  BrowserApiErrorOptions,
  NormalizeBrowserApiErrorOptions,
} from '../shared/errors.ts';

export {
  callbackToPromise,
  isPromiseLike,
  promisifyMethod,
  readLastError,
  resolveMaybePromise,
} from '../shared/promises.ts';
export type { Callback, CallbackOptions } from '../shared/promises.ts';

export {
  isBrowserEvent,
  passthroughEvent,
  requireEvent,
} from '../shared/events.ts';
export type { BrowserEvent, BrowserEventListener } from '../shared/events.ts';

export {
  BROWSER_TARGETS,
  availableCapability,
  isBrowserTarget,
  isManifestVersion,
  unavailableCapability,
} from '../shared/capabilities.ts';
export type {
  ApiAvailability,
  ApiAvailabilityReason,
  BrowserEngine,
  BrowserTarget,
  CapabilityProvider,
  CapabilityQuery,
  ManifestVersion,
} from '../shared/capabilities.ts';

export type { BrowserAdapter } from '../adapters/types.ts';

export {
  createStorageArea,
  createStorageItem,
} from '../api/storage/index.ts';
export type {
  StorageItem,
  StorageItemMeta,
  StorageItemOptions,
  StorageItemValue,
} from '../api/storage/index.ts';

export { createExtensionMessaging } from '../messaging/index.ts';
export type {
  ExtensionMessenger,
  MessageContext,
  MessageData,
  MessageHandler,
  MessageKeys,
  MessageProtocol,
  MessageReturn,
  MessageSendArgs,
  MessagingRuntime,
} from '../messaging/index.ts';
export { createProxyServices } from '../messaging/proxy.ts';
export type {
  AsyncService,
  DefineProxyService,
  MessengerFactory,
  ProxyServiceFactory,
  ProxyServiceRegistration,
} from '../messaging/proxy.ts';

export {
  createContentScriptContext,
  createIframeUi,
  createIntegratedUi,
  createInjectScript,
  createShadowRootUi,
} from '../content/index.ts';
export type {
  AutoMountOptions,
  BaseUiOptions,
  ContentScriptContext,
  ContentScriptContextOptions,
  ContentScriptRuntime,
  ContentScriptTimer,
  ContentScriptUi,
  IframeUiOptions,
  InjectScript,
  InjectScriptApis,
  InjectScriptOptions,
  IntegratedUiOptions,
  ShadowRootContentScriptUi,
  ShadowRootUiOptions,
  UiAlignment,
  UiAnchor,
  UiAppendMode,
  UiPosition,
} from '../content/index.ts';

export {
  createI18nHelper,
  formatMessage,
  i18nHelper,
  t,
} from '../i18n/index.ts';
export type {
  I18nHelper,
  I18nHelperOptions,
  I18nMessageApi,
  I18nSubstitutions,
} from '../i18n/index.ts';

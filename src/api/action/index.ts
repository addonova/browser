import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  ActionApi,
  ActionArea,
  OpenPopupOptions,
  SetBadgeBackgroundColorDetails,
  SetBadgeTextDetails,
  SetIconDetails,
  SetTitleDetails,
} from '../../types/action.ts';
import {
  callAsync,
  isCapabilityAvailable,
  requireEvent,
  unsupportedApiError,
} from '../helpers.ts';

const ACTION_AREAS: readonly ActionArea[] = [
  'action',
  'browserAction',
  'pageAction',
];

export function resolveActionArea(
  adapter: BrowserAdapter,
): ActionArea | null {
  const candidates =
    adapter.manifestVersion === 2
      ? (['browserAction', 'action', 'pageAction'] as const)
      : ACTION_AREAS;

  for (const area of candidates) {
    if (isCapabilityAvailable(adapter, [area])) {
      return area;
    }
  }

  return null;
}

function requireActionArea(adapter: BrowserAdapter): ActionArea {
  const area = resolveActionArea(adapter);

  if (area === null) {
    throw unsupportedApiError('action');
  }

  return area;
}

export function createActionApi(adapter: BrowserAdapter): ActionApi {
  return {
    get area() {
      return resolveActionArea(adapter);
    },
    setBadgeText(details: SetBadgeTextDetails): Promise<void> {
      return callAsync<void>(
        adapter,
        [requireActionArea(adapter), 'setBadgeText'],
        details,
      );
    },
    setBadgeBackgroundColor(
      details: SetBadgeBackgroundColorDetails,
    ): Promise<void> {
      return callAsync<void>(
        adapter,
        [requireActionArea(adapter), 'setBadgeBackgroundColor'],
        details,
      );
    },
    setTitle(details: SetTitleDetails): Promise<void> {
      return callAsync<void>(
        adapter,
        [requireActionArea(adapter), 'setTitle'],
        details,
      );
    },
    setIcon(details: SetIconDetails): Promise<void> {
      return callAsync<void>(
        adapter,
        [requireActionArea(adapter), 'setIcon'],
        details,
      );
    },
    openPopup(options?: OpenPopupOptions): Promise<void> {
      const target = [
        requireActionArea(adapter),
        'openPopup',
      ] as const;

      return options === undefined
        ? callAsync<void>(adapter, target)
        : callAsync<void>(adapter, target, options);
    },
    get onClicked() {
      return requireEvent<
        ActionApi['onClicked']
      >(adapter, [requireActionArea(adapter), 'onClicked']);
    },
  };
}


export type {
  ActionApi,
  ActionArea,
  ColorValue,
  IconImageData,
  IconPath,
  OpenPopupOptions,
  SetBadgeBackgroundColorDetails,
  SetBadgeTextDetails,
  SetIconDetails,
  SetTitleDetails,
  TabDetails,
} from '../../types/action.ts';

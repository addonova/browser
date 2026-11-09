import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  BookmarkCreateDetails,
  BookmarkSearchQuery,
  BookmarksApi,
  BookmarkTreeNode,
  BookmarkUpdateChanges,
} from '../../types/bookmarks.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createBookmarksApi(
  adapter: BrowserAdapter,
): BookmarksApi {
  return {
    getTree(): Promise<BookmarkTreeNode[]> {
      return callAsync<BookmarkTreeNode[]>(
        adapter,
        ['bookmarks', 'getTree'],
      );
    },
    search(
      query: string | BookmarkSearchQuery,
    ): Promise<BookmarkTreeNode[]> {
      return callAsync<BookmarkTreeNode[]>(
        adapter,
        ['bookmarks', 'search'],
        query,
      );
    },
    get(
      idOrIdList: string | readonly string[],
    ): Promise<BookmarkTreeNode[]> {
      return callAsync<BookmarkTreeNode[]>(
        adapter,
        ['bookmarks', 'get'],
        idOrIdList,
      );
    },
    create(details: BookmarkCreateDetails): Promise<BookmarkTreeNode> {
      return callAsync<BookmarkTreeNode>(
        adapter,
        ['bookmarks', 'create'],
        details,
      );
    },
    update(
      id: string,
      changes: BookmarkUpdateChanges,
    ): Promise<BookmarkTreeNode> {
      return callAsync<BookmarkTreeNode>(
        adapter,
        ['bookmarks', 'update'],
        id,
        changes,
      );
    },
    remove(id: string): Promise<void> {
      return callAsync<void>(
        adapter,
        ['bookmarks', 'remove'],
        id,
      );
    },
    removeTree(id: string): Promise<void> {
      return callAsync<void>(
        adapter,
        ['bookmarks', 'removeTree'],
        id,
      );
    },
    get onCreated() {
      return requireEvent<
        BookmarksApi['onCreated']
      >(adapter, ['bookmarks', 'onCreated']);
    },
    get onRemoved() {
      return requireEvent<
        BookmarksApi['onRemoved']
      >(adapter, ['bookmarks', 'onRemoved']);
    },
    get onChanged() {
      return requireEvent<
        BookmarksApi['onChanged']
      >(adapter, ['bookmarks', 'onChanged']);
    },
    get onMoved() {
      return requireEvent<
        BookmarksApi['onMoved']
      >(adapter, ['bookmarks', 'onMoved']);
    },
  };
}


export type {
  BookmarkChangeInfo,
  BookmarkCreateDetails,
  BookmarkMoveInfo,
  BookmarkRemoveInfo,
  BookmarkSearchQuery,
  BookmarksApi,
  BookmarkTreeNode,
  BookmarkUpdateChanges,
} from '../../types/bookmarks.ts';

import type { BrowserEvent } from '../shared/events.ts';

export interface BookmarkTreeNode {
  readonly id: string;
  readonly parentId?: string;
  readonly index?: number;
  readonly url?: string;
  readonly title: string;
  readonly dateAdded?: number;
  readonly dateGroupModified?: number;
  readonly children?: readonly BookmarkTreeNode[];
  readonly unmodifiable?: string;
  readonly [key: string]: unknown;
}

export interface BookmarkCreateDetails {
  readonly parentId?: string;
  readonly index?: number;
  readonly title?: string;
  readonly url?: string;
}

export interface BookmarkUpdateChanges {
  readonly title?: string;
  readonly url?: string;
}

export interface BookmarkSearchQuery {
  readonly query?: string;
  readonly url?: string;
  readonly title?: string;
}

export interface BookmarkRemoveInfo {
  readonly parentId: string;
  readonly index: number;
  readonly node: BookmarkTreeNode;
}

export interface BookmarkChangeInfo {
  readonly title: string;
  readonly url?: string;
}

export interface BookmarkMoveInfo {
  readonly parentId: string;
  readonly index: number;
  readonly oldParentId: string;
  readonly oldIndex: number;
}

export interface BookmarksApi {
  getTree(): Promise<BookmarkTreeNode[]>;
  search(
    query: string | BookmarkSearchQuery,
  ): Promise<BookmarkTreeNode[]>;
  get(idOrIdList: string | readonly string[]): Promise<BookmarkTreeNode[]>;
  create(details: BookmarkCreateDetails): Promise<BookmarkTreeNode>;
  update(
    id: string,
    changes: BookmarkUpdateChanges,
  ): Promise<BookmarkTreeNode>;
  remove(id: string): Promise<void>;
  removeTree(id: string): Promise<void>;
  readonly onCreated: BrowserEvent<
    (id: string, bookmark: BookmarkTreeNode) => void
  >;
  readonly onRemoved: BrowserEvent<
    (id: string, removeInfo: BookmarkRemoveInfo) => void
  >;
  readonly onChanged: BrowserEvent<
    (id: string, changeInfo: BookmarkChangeInfo) => void
  >;
  readonly onMoved: BrowserEvent<
    (id: string, moveInfo: BookmarkMoveInfo) => void
  >;
}

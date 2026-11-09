import type { BrowserAdapter } from '../../adapters/types.ts';
import type {
  DownloadItem,
  DownloadOptions,
  DownloadQuery,
  DownloadsApi,
} from '../../types/downloads.ts';
import { callAsync, requireEvent } from '../helpers.ts';

export function createDownloadsApi(
  adapter: BrowserAdapter,
): DownloadsApi {
  return {
    download(options: DownloadOptions): Promise<number> {
      return callAsync<number>(
        adapter,
        ['downloads', 'download'],
        options,
      );
    },
    cancel(downloadId: number): Promise<void> {
      return callAsync<void>(
        adapter,
        ['downloads', 'cancel'],
        downloadId,
      );
    },
    search(query?: DownloadQuery): Promise<DownloadItem[]> {
      return query === undefined
        ? callAsync<DownloadItem[]>(
            adapter,
            ['downloads', 'search'],
          )
        : callAsync<DownloadItem[]>(
            adapter,
            ['downloads', 'search'],
            query,
          );
    },
    get onChanged() {
      return requireEvent<
        DownloadsApi['onChanged']
      >(adapter, ['downloads', 'onChanged']);
    },
  };
}


export type {
  DownloadHeader,
  DownloadItem,
  DownloadOptions,
  DownloadQuery,
  DownloadsApi,
} from '../../types/downloads.ts';

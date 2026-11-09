import type { BrowserEvent } from '../shared/events.ts';

export interface DownloadHeader {
  readonly name: string;
  readonly value: string;
}

export interface DownloadOptions {
  readonly url: string;
  readonly filename?: string;
  readonly conflictAction?: string;
  readonly saveAs?: boolean;
  readonly method?: string;
  readonly headers?: readonly DownloadHeader[];
  readonly body?: string;
  readonly [key: string]: unknown;
}

export interface DownloadQuery {
  readonly id?: number;
  readonly url?: string;
  readonly filename?: string;
  readonly state?: string;
  readonly limit?: number;
  readonly orderBy?: readonly string[];
  readonly [key: string]: unknown;
}

export interface DownloadItem {
  readonly id: number;
  readonly url: string;
  readonly filename: string;
  readonly state: string;
  readonly bytesReceived?: number;
  readonly totalBytes?: number;
  readonly error?: string;
  readonly mime?: string;
  readonly startTime?: string;
  readonly [key: string]: unknown;
}

export interface DownloadsApi {
  download(options: DownloadOptions): Promise<number>;
  cancel(downloadId: number): Promise<void>;
  search(query?: DownloadQuery): Promise<DownloadItem[]>;
  readonly onChanged: BrowserEvent<
    (item: DownloadItem, delta: Record<string, unknown>) => void
  >;
}

/**
 * レストラン一件分のデータ構造
 */
export interface Restaurant {
  name: string;
  url: string;
  genre: string[];
  area: string[];
  rate: number;
}

/**
 * スクレイパーの実行状態
 * - idle: 待機中
 * - running: 実行中
 * - finished: 完了
 */
export type ScraperStatus = 'idle' | 'running' | 'finished';

/**
 * 拡張機能全体で共有する状態
 */
export interface ScraperState {
  status: ScraperStatus;
  data: Restaurant[];
  currentPageUrl: string;
  sendToSite?: boolean;
  withUpdate?: boolean;
}

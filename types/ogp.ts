/**
 * OGP (Open Graph Protocol) 情報を表す型。
 * 主にウェブサイトの共有時に使用されるメタデータ。
 */
export type OGPData = {
  ogTitle?: string; // og:title (ページのタイトル)
  ogDescription?: string; // og:description (ページの簡単な説明)
  ogImage?: string; // og:image (ページを表す画像のURL)
  ogUrl?: string; // og:url (ページの標準URL)
  ogSiteName?: string; // og:site_name (サイトの名前)
};

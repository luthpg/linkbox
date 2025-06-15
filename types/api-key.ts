/**
 * APIキーのデータ構造を定義する型。
 * データベースにはAPIキーのハッシュ値が保存されます。
 */
export type ApiKey = {
  id: string; // APIキーの一意なID (Convexの_id)
  user_id: string; // APIキーを所有するユーザーのID (ConvexのuserId)
  hashed_api_key?: string; // 実際のAPIキーのハッシュ値 (データベースに保存される)
  // クライアントには実際のapi_keyは渡さず、マスクされたものを表示します
  // 生成時のみフルキーを一度だけ表示します。
  created_at: string; // 作成日時 (ISO 8601形式の文字列、Convexの_creationTime)
  name?: string; // APIキーの識別名 (任意)
};

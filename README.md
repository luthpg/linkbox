# Linkbox

## 概要

**Linkbox**は、Webサイトのブックマークを効率的に管理できるモダンなWebアプリケーションです。
Google認証によるセキュアなログイン、APIキーによる外部連携、OGP情報の自動取得など、個人利用から開発者向けまで幅広く活用できます。

---

## 主な特徴

- **Google認証**による安全なログイン
- **ブックマークのCRUD**（作成・閲覧・編集・削除）
- **OGP情報**（タイトル・説明・画像）を自動取得し、リッチな一覧表示
- **APIキー管理**と**外部API連携**（API経由でのブックマーク登録）
- **レスポンシブデザイン**（PC/スマホ/タブレット対応）
- **リアルタイムバリデーション**と**トースト通知**
- **エラーバウンダリ**による堅牢なUI

---

## 技術スタック

- フロントエンド: Next.js (App Router), React, TypeScript
- UI: shadcn/ui, Googleライクなシンプルデザイン
- バックエンド/認証: Convex（Google認証・DB・API）
- バリデーション: Zod, React Hook Form
- キャッシュ: SWR
- テスト: Vitest, Testing Library
- その他: Sonner（トースト通知）

---

## 使い方

1. [linkbox.ciderjs.com](https://linkbox.ciderjs.com) にアクセス
2. Googleアカウントでログイン
3. 「新規ブックマーク」からURL・タイトル等を入力して登録
4. 一覧画面でOGP付きカード表示・編集・削除が可能
5. 「APIキー管理」画面でAPIキーを発行し、外部アプリからAPI経由でブックマーク登録も可能

---

## API仕様

### ブックマーク登録API

- **エンドポイント**: `POST ${CONVEX_HTTP_URL}/api/bookmarks`
- **認証**: Bearerトークン（APIキー）必須
- **リクエスト例**:
  ```json
  {
    "url": "https://example.com",
    "title": "Example",
    "memo": "メモ（任意）",
    "tags": ["技術", "参考"]
  }
  ```
- **レスポンス**:
  - 成功: `201 Created` + 登録データ
  - 失敗: `400 Bad Request`（バリデーション）、`401 Unauthorized`（認証失敗）

### タグ一覧取得API

- **エンドポイント**: `GET ${CONVEX_HTTP_URL}/api/tags`
- **認証**: Bearerトークン（APIキー）必須
- **レスポンス**:
  - 成功: `201 Created` + タグデータ (`string[]`)
  - 失敗: `400 Bad Request`（バリデーション）、`401 Unauthorized`（認証失敗）

### APIキー管理

- **発行/削除/一覧取得**: Convexの組み込み認証下でのみ操作可能
- **APIキーはSHA-256でハッシュ化して保存**

### OGP情報取得API

- **エンドポイント**: `GET /api/ogp?url={targetUrl}`
- **機能**: 指定URLのOGPメタタグを解析し、JSONで返却

---

## セキュリティ・設計

- APIキーはハッシュ化して保存し、漏洩リスクを最小化
- 各ユーザーのデータは完全に分離
- 外部API経由の登録も厳格なバリデーション・認証を実施
- UIはエラーバウンダリで保護

---

## 開発・テスト

- `pnpm install` で依存関係をインストール
- `pnpm dev` でローカル開発サーバー起動
- `pnpm test` で単体テスト実行

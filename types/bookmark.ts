import { z } from 'zod';

/**
 * ブックマークのデータ構造を定義する型。
 */
export type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  memo?: string | null;
  tags: string[];
  created_at: string;
};

/**
 * ブックマークフォームのバリデーション用Zodスキーマ。
 */
export const BookmarkFormSchema = z.object({
  url: z.string().url({ message: '有効なURLを入力してください。' }), // URL形式のバリデーション
  title: z
    .string()
    .min(1, { message: 'タイトルは必須です。' })
    .max(200, { message: 'タイトルは200文字以内で入力してください。' }), // 必須、最大長
  memo: z
    .string()
    .max(1000, { message: 'メモは1000文字以内で入力してください。' })
    .nullable(), // 最大長、null許容
  tags: z
    .array(
      z
        .string()
        .min(1, 'タグは空にできません。')
        .max(50, 'タグは50文字以内で入力してください。'),
    )
    .max(10, { message: 'タグは最大10個までです。' })
    .default([]), // 文字列配列、各タグの長さ、配列の最大要素数
});

/**
 * Zodスキーマから推論されるフォームデータの型。
 */
export type BookmarkFormData = z.infer<typeof BookmarkFormSchema>;

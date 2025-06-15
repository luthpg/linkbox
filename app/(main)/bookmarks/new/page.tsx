'use client';

import { BookmarkForm } from '@/components/custom/BookmarkForm';
import { api } from '@/convex/_generated/api'; // ConvexのAPI定義をインポート
import type { BookmarkFormData } from '@/types/bookmark';
import { useMutation } from 'convex/react'; // ConvexのuseMutationフックをインポート
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * 新しいブックマークを追加するページコンポーネント。
 * BookmarkFormを使用してユーザー入力を受け付け、Convexに新しいブックマークを保存します。
 */
export default function NewBookmarkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // フォーム送信中の状態を管理

  // ConvexのuseMutationフックで`createBookmark`ミューテーションを呼び出し
  // このミューテーションは、フォームから受け取ったデータで新しいブックマークをConvexに挿入します。
  const createBookmark = useMutation(api.bookmarks.createBookmark);

  /**
   * フォームが送信されたときのハンドラ。
   * @param formData BookmarkFormから受け取ったバリデーション済みのフォームデータ
   */
  const handleCreateBookmark = async (formData: BookmarkFormData) => {
    setIsLoading(true); // ロード中フラグを立てる

    try {
      // `formData.memo` が空文字列の場合、Convexの`v.optional(v.string())`に合わせるため`undefined`に変換します。
      // `formData.tags` がnullやundefinedの場合に備えて空配列にフォールバックします。
      await createBookmark({
        url: formData.url,
        title: formData.title,
        memo:
          formData.memo !== '' && formData.memo != null
            ? formData.memo
            : undefined,
        tags: formData.tags || [],
      });
      toast.success('保存成功', {
        description: '新しいブックマークが正常に保存されました。',
      });
      router.push('/bookmarks'); // 保存後、ブックマーク一覧ページへ遷移
      router.refresh(); // Next.jsルーターのキャッシュをクリアし、UIを最新に保つ
    } catch (error: any) {
      // エラーをanyとしてキャッチ
      toast.error('保存エラー', {
        description: `ブックマークの保存中にエラーが発生しました: ${error.message || '予期せぬエラー'}`,
      });
      console.error('Error inserting bookmark:', error);
    } finally {
      setIsLoading(false); // ロード中フラグを解除
    }
  };

  const handleCancel = () => {
    router.push('/bookmarks');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <BookmarkForm
        onSubmit={handleCreateBookmark}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}

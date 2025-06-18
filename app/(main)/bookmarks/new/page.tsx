'use client';

import { BookmarkForm } from '@/components/custom/BookmarkForm';
import { api } from '@/convex/_generated/api';
import type { BookmarkFormData } from '@/types/bookmark';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewBookmarkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const createBookmark = useMutation(api.bookmarks.createBookmark);

  /**
   * フォームが送信されたときのハンドラ。
   * @param formData BookmarkFormから受け取ったバリデーション済みのフォームデータ
   */
  const handleCreateBookmark = async (formData: BookmarkFormData) => {
    setIsLoading(true);

    try {
      await createBookmark({
        url: formData.url,
        title: formData.title,
        memo:
          formData.memo != null && formData.memo !== ''
            ? formData.memo
            : undefined,
        tags: formData.tags || [],
      });
      toast.success('保存成功', {
        description: '新しいブックマークが正常に保存されました。',
      });
      router.push('/bookmarks/list');
      router.refresh();
    } catch (error) {
      toast.error('保存エラー', {
        description: `ブックマークの保存中にエラーが発生しました: ${(error as Error).message || '予期せぬエラー'}`,
      });
      console.error('Error inserting bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/bookmarks/list');
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

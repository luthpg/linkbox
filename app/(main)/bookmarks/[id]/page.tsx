'use client';

import { BookmarkForm } from '@/components/custom/BookmarkForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { BookmarkFormData } from '@/types/bookmark';
import type { OGPData } from '@/types/ogp';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLinkIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

type EditBookmarkPageProps = {
  id: string;
};

/**
 * 個別のブックマークの編集ページコンポーネント。
 * ブックマークの詳細を表示し、編集フォームを提供します。
 */
export default function EditBookmarkPage() {
  const router = useRouter();
  const { id: bookmarkId } = useParams<EditBookmarkPageProps>();

  // ConvexのuseQueryを使って単一のブックマークを取得します。
  // `bookmarkId` が有効なConvex IDの文字列でない場合、クエリを実行しません。
  // `bookmark` の値は、ロード中に `undefined`、データが見つからない/エラー時に `null`、
  // データが正常にロードされた場合は `Bookmark` 型となります。
  const bookmark = useQuery(
    api.bookmarks.getBookmark,
    { id: bookmarkId as Id<'bookmarks'> }, // stringをId<"bookmarks">にキャスト
  );

  const [isSaving, setIsSaving] = useState(false); // ブックマーク保存中の状態

  // ConvexのuseMutationフックを使ってブックマーク更新ミューテーションを呼び出し
  const updateBookmark = useMutation(api.bookmarks.updateBookmark);

  const ogpFetcher = async ([api, url]: [string, string]) => {
    const res = await fetch(`${api}?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      let errorMessage = `${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {}
      throw new Error(`OGP情報の取得に失敗しました: ${errorMessage}`);
    }
    return res.json();
  };

  const {
    data: ogp,
    isLoading: isOgpLoading,
    error: ogpError,
  } = useSWR<OGPData>(
    bookmark?.url ? ['/api/ogp', bookmark.url] : null,
    ogpFetcher,
  );

  /**
   * ブックマークの更新処理を実行します。
   * @param formData BookmarkFormから受け取ったフォームデータ
   */
  const handleUpdateBookmark = async (formData: BookmarkFormData) => {
    setIsSaving(true); // 保存中フラグを立てる

    try {
      // Convexのミューテーションを呼び出してブックマークを更新します。
      // memoが空文字列の場合はundefinedに変換し、Convexのoptional型に合わせます。
      await updateBookmark({
        id: bookmarkId as Id<'bookmarks'>, // stringをId<"bookmarks">にキャスト
        url: formData.url,
        title: formData.title,
        memo:
          formData.memo != null && formData.memo !== ''
            ? formData.memo
            : undefined,
        tags: formData.tags || [],
      });
      toast.success('更新成功', {
        description: 'ブックマークが正常に更新されました。',
      });
      router.push('/bookmarks/list'); // 更新後、ブックマーク一覧ページへ遷移
      router.refresh(); // Next.jsルーターのキャッシュをクリアし、UIを最新に保つ
    } catch (error) {
      toast.error('更新エラー', {
        description: `ブックマークの更新中にエラーが発生しました: ${(error as Error).message || '予期せぬエラー'}`,
      });
      console.error('Error updating bookmark:', error);
    } finally {
      setIsSaving(false); // 保存中フラグを解除
    }
  };

  /**
   * キャンセルボタンがクリックされたときの処理。
   * ブックマーク一覧ページへ戻ります。
   */
  const handleCancel = () => {
    router.push('/bookmarks/list');
  };

  // --- UIのレンダリングロジック ---

  // bookmarkがundefinedの場合、Convexからのデータロード中と判断し、スケルトンを表示
  if (bookmark === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto mb-6">
          <CardHeader className="pb-3">
            <Skeleton className="w-full h-48 rounded-t-lg mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full mt-1" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-7 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end gap-2 mt-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookmark === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          ブックマークが見つかりませんでした。
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          指定されたブックマークは存在しないか、閲覧する権限がありません。
        </p>
        <Button onClick={() => router.push('/bookmarks/list')}>
          ブックマーク一覧に戻る
        </Button>
      </div>
    );
  }

  // OGP情報があれば優先して表示、なければブックマーク自身の情報でフォールバック
  const displayTitle = bookmark.title ?? ogp?.ogTitle;
  const displayDescription = bookmark.memo ?? ogp?.ogDescription;
  const displayImage = ogp?.ogImage;
  const displayUrl = bookmark.url ?? ogp?.ogUrl;
  const displaySiteName = ogp?.ogSiteName;

  // ogpErrorがあればエラー表示
  if (ogpError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          エラーが発生しました。
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {ogpError.message}
        </p>
        <Button onClick={() => router.push('/bookmarks/list')}>
          ブックマーク一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* OGP情報プレビューカード */}
      <Card className="w-full max-w-2xl mx-auto mb-6">
        <CardHeader className="pb-3">
          {displayImage ? (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg mb-4">
              <img
                src={displayImage}
                alt={displayTitle || 'OGP Image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : isOgpLoading ? (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center text-gray-500 mb-4">
              画像読み込み中...
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 rounded-t-lg text-sm mb-4">
              [No Image]
            </div>
          )}
          <CardTitle className="text-3xl font-bold line-clamp-2 break-all">
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400 flex items-center gap-2"
            >
              {displayTitle}{' '}
              <ExternalLinkIcon className="ml-2 pt-2 h-13 w-13 sm:h-8 sm:w-8" />
            </a>
          </CardTitle>
          {displaySiteName && (
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              {displaySiteName}
            </CardDescription>
          )}
          <CardDescription className="text-sm line-clamp-1 break-all mt-1">
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:underline"
            >
              {displayUrl}
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {displayDescription && (
            <p className="text-base text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
              {displayDescription}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ブックマーク編集フォーム */}
      <BookmarkForm
        initialData={bookmark} // 取得したブックマークデータをフォームに渡す
        onSubmit={handleUpdateBookmark} // フォーム送信時のハンドラ
        onCancel={handleCancel} // キャンセル時のハンドラ
        isLoading={isSaving} // 保存中フラグをフォームに渡す
      />
    </div>
  );
}

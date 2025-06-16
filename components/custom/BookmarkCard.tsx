'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Bookmark } from '@/types/bookmark';
import type { OGPData } from '@/types/ogp';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';

interface BookmarkCardProps {
  bookmark: Bookmark;
  ogp?: OGPData | null;
  isOgpLoading?: boolean;
  onEdit: (bookmarkId: string) => void;
  onDelete: (bookmarkId: string) => void;
}

/**
 * 個々のブックマークを表示するカードコンポーネント。
 * タイトル、URL、メモ、タグ、そして編集・削除アクションボタンを含みます。
 * OGP情報があれば、それを使用してよりリッチな表示を行います。
 * @param bookmark 表示するBookmarkオブジェクト
 * @param ogp 取得したOGPデータ (オプション)
 * @param isOgpLoading OGPデータのロード中かどうか
 * @param onEdit 編集ボタンがクリックされたときに呼び出される関数
 * @param onDelete 削除ボタンがクリックされたときに呼び出される関数
 */
export function BookmarkCard({
  bookmark,
  ogp,
  isOgpLoading,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const displayTitle = ogp?.ogTitle || bookmark.title;
  const displayDescription = ogp?.ogDescription || bookmark.memo;
  const displayImage = ogp?.ogImage;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      {isOgpLoading ? (
        <Skeleton className="w-full h-40 rounded-t-lg" />
      ) : displayImage ? (
        <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
          <img
            src={displayImage}
            alt={displayTitle || 'OGP Image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              console.error(`Failed to load OGP image: ${displayImage}`);
            }}
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 rounded-t-lg text-sm">
          [Image of Placeholder]
        </div>
      )}

      <CardHeader className="pb-3 flex-grow">
        <CardTitle className="text-xl line-clamp-2 break-all mb-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-blue-600 dark:text-blue-400"
          >
            {displayTitle}
          </a>
        </CardTitle>
        <CardDescription className="text-sm line-clamp-1 break-all">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:underline"
          >
            {bookmark.url}
          </a>
        </CardDescription>
        {displayDescription && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
            {displayDescription}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col justify-end px-6 py-0">
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto mb-4">
            {bookmark.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <button type="button">
                  <Link href={`/bookmarks?tag=${tag}`}>{tag}</Link>
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(bookmark.id)}
            aria-label="編集"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(bookmark.id)}
            aria-label="削除"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

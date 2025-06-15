'use client';

import { BookmarkCard } from '@/components/custom/BookmarkCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Bookmark } from '@/types/bookmark';
import type { OGPData } from '@/types/ogp';
import { useMutation } from 'convex/react';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface BookmarkListClientProps {
  bookmarks: Bookmark[] | undefined | null;
  tag: string | null;
}

export function BookmarkListClient({
  bookmarks,
  tag,
}: BookmarkListClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] =
    useState<Id<'bookmarks'> | null>(null);
  const [ogpDataMap, setOgpDataMap] = useState<Map<string, OGPData>>(new Map());
  const [ogpLoadingMap, setOgpLoadingMap] = useState<Map<string, boolean>>(
    new Map(),
  );

  const deleteBookmark = useMutation(api.bookmarks.deleteBookmark);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 'ogpLoadingMap' ignore infinite loop
  useEffect(() => {
    if (bookmarks == undefined) return; // bookmarksがまだロードされていない場合は何もしない

    const fetchOgpForBookmark = async (bookmark: Bookmark) => {
      if (ogpLoadingMap.get(bookmark.id) || ogpDataMap.has(bookmark.id)) {
        return;
      }

      setOgpLoadingMap((prev) => new Map(prev).set(bookmark.id, true));
      try {
        const response = await fetch(
          `/api/ogp?url=${encodeURIComponent(bookmark.url)}`,
        );
        if (response.ok) {
          const ogp: OGPData = await response.json();
          setOgpDataMap((prev) => new Map(prev).set(bookmark.id, ogp));
        } else {
          console.warn(
            `Failed to fetch OGP for ${bookmark.url}: ${response.status} ${response.statusText}`,
          );
          // OGP取得失敗時はエラーログのみで、UIはブックマークデータでフォールバック
        }
      } catch (error) {
        console.error(`Error fetching OGP for ${bookmark.url}:`, error);
      } finally {
        setOgpLoadingMap((prev) => new Map(prev).set(bookmark.id, false));
      }
    };

    if (bookmarks !== null) {
      for (const bookmark of bookmarks) {
        fetchOgpForBookmark(bookmark);
      }
    }
  }, [bookmarks, ogpDataMap]);

  const handleEdit = (id: string) => {
    router.push(`/bookmarks/${id}`);
  };

  const handleDeleteClick = (id: Id<'bookmarks'>) => {
    setBookmarkToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!bookmarkToDelete) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    let error: Error | null = null;
    try {
      await deleteBookmark({ id: bookmarkToDelete });
    } catch (e) {
      error = e as Error;
    }

    if (error) {
      console.error('Error deleting bookmark:', error.message);
      toast.error('ブックマークの削除中にエラーが発生しました。', {
        description: error.message,
      });
    } else {
      toast.success('ブックマークを削除しました', {
        description: '指定されたブックマークが正常に削除されました。',
      });
      router.refresh();
    }

    setIsDeleting(false);
    setBookmarkToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBookmarkToDelete(null);
  };

  if (bookmarks === undefined) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="flex flex-col h-full">
            <Skeleton className="w-full h-40 rounded-t-lg" />
            <CardHeader className="pb-3 flex-grow">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardHeader>
            <CardContent className="flex flex-col justify-end p-6 pt-0">
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookmarks == null || bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          まだブックマークがありません。
        </p>
        <Link href="/bookmarks/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            新しいブックマークを追加
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tag ? `#${tag}` : '#All'}
          </h1>
          <Link href="/bookmarks/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              ブックマーク追加
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              ogp={ogpDataMap.get(bookmark.id)}
              isOgpLoading={ogpLoadingMap.get(bookmark.id)}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このブックマークは完全に削除され、元に戻すことはできません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

'use client';

import {
  BookmarkCard,
  BookmarkSimpleCard,
} from '@/components/custom/BookmarkCard';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Bookmark } from '@/types/bookmark';
import type { OGPData } from '@/types/ogp';
import { useAction, useMutation } from 'convex/react';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

interface BookmarkListClientProps {
  bookmarks: Bookmark[] | undefined | null;
  tag: string | null;
}

type ListType = 'rich' | 'simple';

const ogpFetcher = async ([key, url]: [string, string]) => {
  const response = await fetch(`${key}?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch OGP data');
  }
  return response.json();
};

const MemoizedBookmarkCard = memo(
  ({
    bookmark,
    listType,
    onEdit,
    onDelete,
  }: {
    bookmark: Bookmark;
    listType: 'rich' | 'simple';
    onEdit: (id: string) => void;
    onDelete: (id: Id<'bookmarks'>) => void;
  }) => {
    const fetchOgpAction = useAction(api.ogp.fetchOgp);

    const ogpFetcher = async ([api, url]: [string, string]) => {
      try {
        const res = await fetchOgpAction({ url });
        return res;
      } catch (error) {
        console.error(`(${api}) Error fetching OGP data:`, error);
        return {};
      }
    };

    const {
      data: ogp,
      error,
      isLoading: isOgpLoading,
    } = useSWR<OGPData, Error>(
      bookmark.url ? ['ogp', bookmark.url] : null,
      ogpFetcher,
      { revalidateOnFocus: false, dedupingInterval: 600000 },
    );

    const displayOgp = error ? null : ogp;
    const CardComponent =
      listType === 'rich' ? BookmarkCard : BookmarkSimpleCard;

    return (
      <CardComponent
        bookmark={bookmark}
        ogp={displayOgp}
        isOgpLoading={isOgpLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  },
);
MemoizedBookmarkCard.displayName = 'MemoizedBookmarkCard';

export function BookmarkListClient({
  bookmarks,
  tag,
}: BookmarkListClientProps) {
  const router = useRouter();
  const [listType, setListType] = useState<ListType>('rich');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] =
    useState<Id<'bookmarks'> | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    setListType(isMobile ? 'simple' : 'rich');
  }, [isMobile]);

  const deleteBookmark = useMutation(api.bookmarks.deleteBookmark);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/bookmarks/${id}`);
    },
    [router],
  );

  const handleDeleteClick = useCallback((id: Id<'bookmarks'>) => {
    setBookmarkToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!bookmarkToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBookmark({ id: bookmarkToDelete });
      toast.success('ブックマークを削除しました', {
        description: '指定されたブックマークが正常に削除されました。',
      });
    } catch (e) {
      console.error('Error deleting bookmark:', (e as Error).message);
      toast.error('ブックマークの削除中にエラーが発生しました。', {
        description: (e as Error).message || 'エラーが発生しました。',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setBookmarkToDelete(null);
    }
  }, [bookmarkToDelete, deleteBookmark]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setBookmarkToDelete(null);
  }, []);

  if (bookmarks === undefined) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 })
          .map((_, index) => index.toString())
          .map((index) => (
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
          <div className="ml-auto mr-3">
            <Select onValueChange={(value) => setListType(value as ListType)}>
              <SelectTrigger className="w-30">
                <SelectValue placeholder="List View" defaultValue={listType} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>リストビュー</SelectLabel>
                  <SelectItem value="rich" defaultChecked={listType === 'rich'}>
                    リッチ
                  </SelectItem>
                  <SelectItem
                    value="simple"
                    defaultChecked={listType === 'simple'}
                  >
                    シンプル
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Link href="/bookmarks/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              {!isMobile && 'ブックマーク追加'}
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <MemoizedBookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              listType={listType}
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

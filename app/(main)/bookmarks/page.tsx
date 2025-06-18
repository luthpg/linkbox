'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { api } from '@/convex/_generated/api';
import type { Bookmark } from '@/types/bookmark';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

export default function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tag, setTag] = useState<string | null>(null);

  const allBookmarks = useQuery(api.bookmarks.getBookmarks);

  useEffect(() => {
    const getTag = async () => {
      const { tag } = await searchParams;
      const singleTag = tag && Array.isArray(tag) ? tag[0] : (tag ?? null);
      setTag(singleTag);
    };
    getTag();
  }, [searchParams]);

  useEffect(() => {
    const filteredBookmarks =
      tag != null
        ? allBookmarks?.filter(({ tags }) => tags.includes(tag))
        : allBookmarks;
    filteredBookmarks != null && setBookmarks(filteredBookmarks);
  }, [tag, allBookmarks]);

  return (
    <div className="p-3">
      <BookmarkListClient
        bookmarks={allBookmarks == null ? undefined : bookmarks}
        tag={tag}
      />
    </div>
  );
}

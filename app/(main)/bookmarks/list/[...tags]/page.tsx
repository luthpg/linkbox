'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { api } from '@/convex/_generated/api';
import type { Bookmark } from '@/types/bookmark';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

export default function BookmarksPage({
  params,
}: {
  params: Promise<{ tags: string[] }>
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tag, setTag] = useState<string | null>(null);

  const allBookmarks = useQuery(api.bookmarks.getBookmarks);

  useEffect(() => {
    const getTags = async () => {
      const { tags } = await params;
      setTag(decodeURI(tags.join('/')))
    };
    getTags();
  }, [params]);

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

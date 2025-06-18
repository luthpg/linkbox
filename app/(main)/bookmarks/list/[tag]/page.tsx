'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { api } from '@/convex/_generated/api';
import type { Bookmark } from '@/types/bookmark';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type TagFilteredBookmarksListProps = {
  tag: string;
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tag, setTag] = useState<string | null>(null);

  const { tag: tagInQuery } = useParams<TagFilteredBookmarksListProps>();
  const allBookmarks = useQuery(api.bookmarks.getBookmarks);

  useEffect(() => {
    setTag(tagInQuery);
  }, [tagInQuery]);

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

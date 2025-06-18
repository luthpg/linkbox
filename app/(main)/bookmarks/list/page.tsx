'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function BookmarksPage() {
  const bookmarks = useQuery(api.bookmarks.getBookmarks);
  return (
    <div className="p-3">
      <BookmarkListClient
        bookmarks={bookmarks == null ? undefined : bookmarks}
        tag={null}
      />
    </div>
  );
}

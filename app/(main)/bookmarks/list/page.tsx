'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';

export default function BookmarksPage() {
  return (
    <div className="p-3">
      <BookmarkListClient
        tag={null}
      />
    </div>
  );
}

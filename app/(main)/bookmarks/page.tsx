'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { api } from '@/convex/_generated/api';
import type { Bookmark } from '@/types/bookmark';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

const testBookmarks: Bookmark[] = [
  {
    id: '1',
    url: 'https://zenn.dev/luth/articles/gas-coding-idea-team',
    title: 'Example Bookmark',
    memo: 'This is an example bookmark.',
    tags: ['tag1', 'tag2', 'tag3'],
    user_id: '1',
    created_at: '2023-06-01T00:00:00.000Z',
  },
  {
    id: '2',
    url: 'https://zenn.dev/luth',
    title: 'Example Bookmark',
    memo: 'This is an example bookmark.',
    tags: ['tag1', 'tag4'],
    user_id: '1',
    created_at: '2023-06-01T00:00:00.000Z',
  },
];

export default function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(testBookmarks);
  const [tag, setTag] = useState<string | null>(null);

  // const allBookmarks = useQuery(api.bookmarks.getBookmarks);
  const allBookmarks = [
    ...testBookmarks,
    ...(useQuery(api.bookmarks.getBookmarks) ?? []),
  ];

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
  }, [tag]);

  if (allBookmarks == null) {
    return (
      <div className="p-3">
        <BookmarkListClient bookmarks={undefined} tag={tag} />
      </div>
    );
  }

  return (
    <div className="p-3">
      <BookmarkListClient bookmarks={bookmarks} tag={tag} />
    </div>
  );
}

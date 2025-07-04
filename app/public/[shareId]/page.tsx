'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';

export default function SharedBookmarkPage() {
  const { shareId } = useParams<{ shareId: string }>();

  const data = useQuery(api.tags.getPublicBookmarksByShareId, { shareId });

  if (data === undefined) {
    return <p>読み込み中...</p>;
  }

  if (data === null) {
    return <p>この共有リンクは無効か、非公開に設定されています。</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">linkbox</h1>

      <p className="text-muted-foreground mb-6">
        {data.ownerName || '匿名ユーザー'} さんによって共有されています。
      </p>

      <BookmarkListClient tag={data.tagName} isPublic />
    </div>
  );
}
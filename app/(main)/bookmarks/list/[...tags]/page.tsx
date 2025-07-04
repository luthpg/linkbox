'use client';

import { BookmarkListClient } from '@/components/custom/BookmarkListClient';
import { useEffect, useState } from 'react';

export default function BookmarksWithTagPage({
  params,
}: {
  params: Promise<{ tags: string[] }>;
}) {
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    const resolveParamsAndSetTag = async () => {
      try {
        const resolvedParams = await params;
        const decodedTag = decodeURI(resolvedParams.tags.join('/'));
        setTag(decodedTag);
      } catch (error) {
        console.error('Failed to process parameters:', error);
        setTag(null);
      }
    };

    resolveParamsAndSetTag();
  }, [params]);

  return (
    <div className="p-3">
      <BookmarkListClient tag={tag} />
    </div>
  );
}

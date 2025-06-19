'use client';

import { AuthNavButton } from '@/components/custom/AuthNavButton';
import { AppSidebar } from '@/components/custom/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useConvexAuth } from 'convex/react';
import {
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  HelpCircle,
  type LucideIcon,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const PageMaster: Array<{
  path: string | RegExp;
  title: string;
  icon: LucideIcon;
}> = [
  {
    path: '/bookmarks/list',
    title: 'ブックマーク',
    icon: BookmarkCheck,
  },
  {
    path: /\/bookmarks\/list\/.+/,
    title: 'ブックマーク',
    icon: BookmarkCheck,
  },
  {
    path: '/bookmarks/new',
    title: '新規作成',
    icon: BookmarkPlus,
  },
  {
    path: /\/bookmarks\/.+/,
    title: '詳細',
    icon: Bookmark,
  },
  {
    path: /\/config.*/,
    title: '設定',
    icon: Settings,
  },
  {
    path: '/help',
    title: 'ヘルプ',
    icon: HelpCircle,
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const path = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.warning('ログインしてください');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1>
              {PageMaster.find((m) =>
                typeof m.path === 'string'
                  ? m.path === path
                  : m.path.test(path),
              )?.title ?? 'linkbox'}
            </h1>
          </div>
          <div className="ml-auto px-3 flex align-middle">
            <AuthNavButton />
          </div>
        </header>
        <main>
          {isAuthenticated ? (
            children
          ) : (
            <div className="flex flex-1 flex-col gap-4 px-4 py-10">
              {[...new Array(5)]
                .map((_, index) => index.toString())
                .map((index) => (
                  <Skeleton
                    key={`skeleton-${index}`}
                    className="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl"
                  />
                ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

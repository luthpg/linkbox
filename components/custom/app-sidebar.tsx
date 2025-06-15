'use client';

import { NavItemGroups } from '@/components/custom/nav-itemgroups';
import { NavMain } from '@/components/custom/nav-main';
import { NavSecondary } from '@/components/custom/nav-secondary';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import {
  Home,
  LogOut,
  MessageCircleQuestion,
  Moon,
  Search,
  Settings2,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import type * as React from 'react';
import { toast } from 'sonner';

const testBookmarks = [
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const bookmarks = useQuery(api.bookmarks.getBookmarks) ?? [];
  const bookmarks = [
    ...testBookmarks,
    ...(useQuery(api.bookmarks.getBookmarks) ?? []),
  ]; // test

  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const tags = [...new Set(bookmarks.flatMap((b) => b.tags))]
    .sort()
    .map((tag) => ({
      name: tag,
      url: `/bookmarks?tag=${tag}`,
      emoji: '📌',
    }));

  const navData = {
    navMain: [
      {
        title: '検索',
        onClick: () => {
          toast.info('検索機能は開発中ですね');
        },
        icon: Search,
      },
      {
        title: '全件表示',
        url: '/bookmarks',
        icon: Home,
      },
    ],
    navSecondary: [
      {
        title: '設定',
        url: '/config',
        icon: Settings2,
      },
      {
        title: theme === 'dark' ? 'ライトモード' : 'ダークモード',
        onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        icon: theme === 'dark' ? Sun : Moon,
      },
      {
        title: 'ログアウト',
        onClick: async () => await signOut(),
        icon: LogOut,
      },
      {
        title: 'ヘルプ',
        url: '/help',
        icon: MessageCircleQuestion,
      },
    ],
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <NavMain items={navData.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavItemGroups itemGroups={tags} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={navData.navSecondary} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

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
import { SiGithub } from '@icons-pack/react-simple-icons';
import { useMutation, useQuery } from 'convex/react';
import {
  Home,
  LogOut,
  MessageCircleQuestion,
  Moon,
  // Search,
  Settings2,
  SparklesIcon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { random, search } from 'node-emoji';
import type * as React from 'react';
// import { toast } from 'sonner';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const bookmarks = useQuery(api.bookmarks.getBookmarks) ?? [];

  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const tags = [...new Set(bookmarks.flatMap((b) => b.tags))]
    .sort()
    .map((tag) => {
      const lastTag = tag.split('/').pop();
      const emoji = lastTag != null ? search(lastTag) : [];
      return {
        name: tag,
        url: `/bookmarks/list/${tag}`,
        emoji: (emoji.length ? emoji[0] : random()).emoji,
      };
    });

  const navData = {
    navMain: [
      {
        title: 'linkbox',
        url: '/',
        icon: SparklesIcon,
      },
      // {
      //   title: '検索',
      //   onClick: () => {
      //     toast.info('検索機能は開発中ですね');
      //   },
      //   icon: Search,
      // },
      {
        title: '全件表示',
        url: '/bookmarks/list',
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
        title: 'リポジトリ',
        url: 'https://github.com/luthpg/linkbox',
        icon: SiGithub,
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

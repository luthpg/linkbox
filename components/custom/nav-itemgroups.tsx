'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { api } from '@/convex/_generated/api';
import { copyUrl, writeClipboardSync } from '@/lib/utils';
import { useMutation, useQuery } from 'convex/react';
import {
  EyeOffIcon,
  Link as LinkIcon,
  MoreHorizontal,
  Share2Icon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export type ItemGroup = {
  name: string;
  url: string;
  emoji: string;
};

function DropdownMenuItems({
  item,
}: {
  item: ItemGroup;
}) {
  const isShared = useQuery(api.tags.isTagShared, { tagName: item.name });
  const shareTag = useMutation(api.tags.shareTag);
  const unshareTag = useMutation(api.tags.unshareTag);

  const handleShare = async (tagName: string) => {
    try {
      await writeClipboardSync(async () => {
        const shareId = await shareTag({ tagName });
        const { origin } = new URL(window.location.href);
        return `${origin}/public/${shareId}`;
      });
      toast.success('共有リンクをコピーしました！', {
        description: `タグ「${tagName}」のブックマークが共有できます。`,
      });
    } catch (error) {
      toast.error('共有に失敗しました。');
    }
  };

  const handleUnshare = async (tagName: string) => {
    try {
      await unshareTag({ tagName });
      toast.success('共有を解除しました。');
    } catch (error) {
      toast.error('共有解除に失敗しました。');
    }
  };

  const handleCopyInternalLink = async (url: string) => {
    try {
      await copyUrl(url);
      toast.success('個人用タグURLをコピーしました！');
    } catch (error) {
      toast.error('コピーに失敗しました。');
    }
  }

  return (
    <>
      <DropdownMenuItem onClick={async () => await handleShare(item.name)}>
        <Share2Icon className="text-muted-foreground" />
        <span>{isShared ? 'タグ共有用URLをコピー' : 'タグを共有'}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={async () => await handleUnshare(item.name)}>
        <EyeOffIcon className="text-muted-foreground" />
        <span>タグの共有を解除</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={async () => await handleCopyInternalLink(item.url)}>
        <LinkIcon className="text-muted-foreground" />
        <span>個人用タグURLをコピー</span>
      </DropdownMenuItem>
    </>
  );
}

export function NavItemGroups({
  itemGroups,
}: {
  itemGroups: ItemGroup[];
}) {
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>タグ</SidebarGroupLabel>
      <SidebarMenu>
        {itemGroups.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link
                href={item.url}
                title={item.name}
                onClick={() => isMobile && toggleSidebar()}
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItems item={item} />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

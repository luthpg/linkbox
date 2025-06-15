'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

export type mainNavItem = {
  title: string;
  url?: string;
  onClick?: () => void | Promise<void>;
  icon: LucideIcon;
  isActive?: boolean;
};

export function NavMain({
  items,
}: {
  items: mainNavItem[];
}) {
  const { isMobile, toggleSidebar } = useSidebar();
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            {item.url != null ? (
              <Link href={item.url} onClick={() => isMobile && toggleSidebar()}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            ) : item.onClick != null ? (
              <button
                type="button"
                onClick={() => {
                  item.onClick && item.onClick();
                  isMobile && toggleSidebar();
                }}
              >
                <item.icon />
                <span>{item.title}</span>
              </button>
            ) : null}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

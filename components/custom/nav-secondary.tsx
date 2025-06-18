import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export type SecondaryNavItem = {
  title: string;
  url?: string;
  icon: LucideIcon;
  badge?: string;
  onClick?: () => void;
};

export function NavSecondary({
  items,
  ...props
}: {
  items: SecondaryNavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { isMobile, toggleSidebar } = useSidebar();
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                {item.url != null ? (
                  <Link
                    href={item.url}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : item.onClick != null ? (
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick?.();
                      isMobile && toggleSidebar();
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </button>
                ) : null}
              </SidebarMenuButton>
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

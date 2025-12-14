"use client";

import { ArrowLeft, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const settingsItems = [
  {
    title: "Preferences",
    url: "preferences",
    icon: Settings,
  },
  {
    title: "Members",
    url: "members",
    icon: Users,
  },
];

export function SettingsSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const workspace = params.workspace as string;

  const basePath = `/${encodeURIComponent(workspace)}/settings`;

  return (
    <SidebarGroup>
      <Link
        className="mb-4 flex items-center gap-2 p-2 text-muted-foreground text-sm hover:text-foreground"
        href={`/${encodeURIComponent(workspace)}`}
      >
        <ArrowLeft className="size-4" />
        <span>Back to workspace</span>
      </Link>
      <SidebarGroupLabel className="px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
        Settings
      </SidebarGroupLabel>
      <SidebarMenu>
        {settingsItems.map((item) => {
          const href = `${basePath}/${item.url}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "group relative transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "hover:bg-sidebar-accent/50"
                )}
                isActive={isActive}
                tooltip={item.title}
              >
                <Link className="flex items-center gap-2" href={href}>
                  {item.icon ? (
                    <item.icon
                      className={cn(
                        "size-4 transition-colors duration-200",
                        isActive
                          ? "text-sidebar-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    />
                  ) : null}
                  <span className="flex-1">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

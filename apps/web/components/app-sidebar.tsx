"use client";

import {
  Briefcase,
  Clock,
  GalleryVerticalEnd,
  Inbox,
  Plus,
  Square,
  TrendingUp,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { NavUser } from "./nav-user";

const data = {
  workspaces: [
    {
      name: "testFirst1",
      logo: GalleryVerticalEnd,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      badge: 3,
    },
    {
      title: "My issues",
      url: "#",
      icon: TrendingUp,
    },
    {
      title: "Create workspace",
      url: "/workspaces/new",
      icon: Plus,
    },
    {
      title: "Workspace",
      url: "#",
      icon: undefined,
      isActive: true,
      isCollapsible: true,
      items: [
        {
          title: "Projects",
          url: "/workspaces/projects",
          icon: Briefcase,
        },

        {
          title: "Issues",
          url: "#",
          icon: Square,
          badge: 12,
        },
        {
          title: "Cycles",
          isActive: true,
          isCollapsible: false,
          url: "#",
          icon: Clock,
          items: [
            {
              title: "Current",
              url: "#",
            },
            {
              title: "Upcoming",
              url: "#",
            },
          ],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-2">
        <NavMain items={data.navMain} showLabel={false} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t">
        <NavUser
          user={{
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import { ChevronDown, ExternalLink, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function WorkspaceSwitcher({
  workspaces,
}: {
  workspaces: {
    name: string;
    logo: React.ElementType;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="flex aspect-square size-6 items-center justify-center rounded-sm bg-primary text-white">
                <span className="font-semibold text-xs">
                  {activeWorkspace.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace.name}
                </span>
              </div>
              <ChevronDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                className="gap-2 p-2"
                key={workspace.name}
                onClick={() => setActiveWorkspace(workspace)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <workspace.logo className="size-3.5 shrink-0" />
                </div>
                {workspace.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Users className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Invite and add members
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link className="flex items-center gap-2" href="/workspaces/new">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add workspace
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="h-8 w-8" size="icon" variant="outline">
          <ExternalLink className="size-4" />
          <span className="sr-only">Create new issue</span>
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

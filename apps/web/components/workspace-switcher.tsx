"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ExternalLink, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { attempt } from "@/lib/error-handling";
import { listWorkspaces, Workspace } from "@/lib/workspace";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | undefined>(
    undefined
  );
  const { data: workspaces } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const [result, error] = await attempt(listWorkspaces());
      if (error || !result) {
        toast.error("Error while fetching workspaces");
        return;
      }
      setActiveWorkspace(result.data.workspaces[0]);
      return result.data.workspaces;
    },
  });

  const router = useRouter();

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
                  {activeWorkspace?.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace?.name}
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
            {workspaces?.slice(0, 2).map((workspace) => (
              <DropdownMenuItem
                className="gap-2 p-2"
                key={workspace.name}
                onClick={() => {
                  setActiveWorkspace(workspace);
                  router.push(`/${encodeURIComponent(workspace.slug)}`);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md border text-muted-foreground text-xs">
                  {workspace.name.slice(0, 2).toUpperCase()}
                </div>
                {workspace.name}
              </DropdownMenuItem>
            ))}
            {workspaces && workspaces.length > 1 ? (
              <DropdownMenuItem className="text-muted-foreground">
                See more
              </DropdownMenuItem>
            ) : null}
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

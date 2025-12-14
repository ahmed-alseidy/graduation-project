"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function WorkspaceLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSettingsRoute = pathname?.includes("/settings") ?? false;
  return (
    <SidebarProvider>
      {!isSettingsRoute && <AppSidebar />}
      <div className="flex h-full w-full flex-col">
        {!isSettingsRoute && (
          <header className="flex h-12 w-full shrink-0 items-center gap-4 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator className="h-4 bg-border" orientation="vertical" />
          </header>
        )}
        {children}
      </div>
    </SidebarProvider>
  );
}

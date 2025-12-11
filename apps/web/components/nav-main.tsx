"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Icon color mapping for different menu items
const iconColors: Record<string, string> = {
  Inbox: "text-blue-500 dark:text-blue-400",
  "My issues": "text-purple-500 dark:text-purple-400",
  "Create workspace": "text-green-500 dark:text-green-400",
  Projects: "text-orange-500 dark:text-orange-400",
  Issues: "text-red-500 dark:text-red-400",
  Cycles: "text-cyan-500 dark:text-cyan-400",
};

type NestedNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  badge?: string | number;
};

type NavSubItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  badge?: string | number;
  items?: NestedNavItem[];
};

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isCollapsible?: boolean;
  badge?: string | number;
  items?: NavSubItem[];
};

function Badge({ badge }: { badge: string | number }) {
  return (
    <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center font-medium text-primary-foreground text-xs">
      {badge}
    </span>
  );
}

function SubBadge({ badge }: { badge: string | number }) {
  return (
    <span className="min-w-5 rounded-full bg-primary/10 px-1.5 py-0.5 text-center font-medium text-primary text-xs">
      {badge}
    </span>
  );
}

function SimpleNavItem({ item }: { item: NavItem }) {
  const iconColor = iconColors[item.title] ?? "text-muted-foreground";
  const activeIconColor = item.isActive
    ? iconColor
    : iconColor.replace("500", "400");

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        className={cn(
          "group relative transition-all duration-200",
          item.isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "hover:bg-sidebar-accent/50"
        )}
        isActive={item.isActive}
        tooltip={item.title}
      >
        <a className="flex items-center gap-2" href={item.url}>
          {item.icon ? (
            <item.icon
              className={cn(
                "size-4 transition-colors duration-200",
                activeIconColor
              )}
            />
          ) : null}
          <span className="flex-1">{item.title}</span>
          {item.badge ? <Badge badge={item.badge} /> : null}
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NestedNavItem({ nestedItem }: { nestedItem: NestedNavItem }) {
  return (
    <SidebarMenuSubItem key={nestedItem.title}>
      <SidebarMenuSubButton
        asChild
        className={cn(
          "transition-all duration-200",
          nestedItem.isActive ? "bg-sidebar-accent/20 font-medium" : ""
        )}
        isActive={nestedItem.isActive}
      >
        <a className="flex items-center gap-2" href={nestedItem.url}>
          <span className="flex-1">{nestedItem.title}</span>
          {nestedItem.badge ? <SubBadge badge={nestedItem.badge} /> : null}
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function CollapsibleSubItem({ subItem }: { subItem: NavSubItem }) {
  const subIconColor = iconColors[subItem.title] ?? "text-muted-foreground";
  const activeSubIconColor = subItem.isActive
    ? subIconColor
    : subIconColor.replace("500", "400");

  if (subItem.items && subItem.items.length > 0) {
    return (
      <Collapsible
        asChild
        className="group/nested"
        defaultOpen={subItem.isActive}
        key={subItem.title}
      >
        <SidebarMenuSubItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton
              className={cn(
                "transition-all duration-200",
                subItem.isActive ? "bg-sidebar-accent/30" : ""
              )}
              isActive={subItem.isActive}
            >
              {subItem.icon ? (
                <subItem.icon
                  className={cn(
                    "size-4 transition-colors duration-200",
                    activeSubIconColor
                  )}
                />
              ) : null}
              <span className="flex-1 text-left">{subItem.title}</span>
              {subItem.badge ? (
                <span className="mr-1 min-w-5 rounded-full bg-primary/10 px-1.5 py-0.5 text-center font-medium text-primary text-xs">
                  {subItem.badge}
                </span>
              ) : null}
              <ChevronRight className="ml-auto size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]/nested:rotate-90" />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden transition-all duration-200">
            <SidebarMenuSub className="mt-1 ml-4 space-y-0.5 border-sidebar-border border-l pl-2">
              {subItem.items.map((nestedItem) => (
                <NestedNavItem key={nestedItem.title} nestedItem={nestedItem} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuSubItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton
        asChild
        className={cn(
          "transition-all duration-200",
          subItem.isActive ? "bg-sidebar-accent/30 font-medium" : ""
        )}
        isActive={subItem.isActive}
      >
        <a className="flex items-center gap-2" href={subItem.url}>
          {subItem.icon ? (
            <subItem.icon
              className={cn(
                "size-4 transition-colors duration-200",
                activeSubIconColor
              )}
            />
          ) : null}
          <span className="flex-1">{subItem.title}</span>
          {subItem.badge ? <SubBadge badge={subItem.badge} /> : null}
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function CollapsibleNavItem({ item }: { item: NavItem }) {
  const iconColor = iconColors[item.title] ?? "text-muted-foreground";
  const activeIconColor = item.isActive
    ? iconColor
    : iconColor.replace("500", "400");

  return (
    <Collapsible
      asChild
      className="group/collapsible w-full"
      defaultOpen={item.isActive}
      key={item.title}
    >
      <SidebarMenuItem className="w-full">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "transition-all duration-200",
              item.isActive ? "bg-sidebar-accent/50" : ""
            )}
            tooltip={item.title}
          >
            {item.icon ? (
              <item.icon
                className={cn(
                  "size-4 transition-colors duration-200",
                  activeIconColor
                )}
              />
            ) : null}
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge ? (
              <span className="mr-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center font-medium text-primary-foreground text-xs">
                {item.badge}
              </span>
            ) : null}
            <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden transition-all duration-200">
          <SidebarMenuSub className="mt-1 space-y-0.5">
            {item.items?.map((subItem) => (
              <CollapsibleSubItem key={subItem.title} subItem={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({
  items,
  showLabel = false,
}: {
  items: NavItem[];
  showLabel?: boolean;
}) {
  return (
    <SidebarGroup>
      {showLabel ? (
        <SidebarGroupLabel className="px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Workspace
        </SidebarGroupLabel>
      ) : null}
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = Boolean(item.items?.length ?? 0);
          const isCollapsible = Boolean(item.isCollapsible) && hasSubItems;

          if (!isCollapsible) {
            return <SimpleNavItem item={item} key={item.title} />;
          }

          return <CollapsibleNavItem item={item} key={item.title} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

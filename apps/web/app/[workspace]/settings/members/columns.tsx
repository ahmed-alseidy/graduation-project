"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceMember } from "@/lib/workspace";

export const columns: ColumnDef<WorkspaceMember>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "image",
    header: "Image",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge
        variant={row.original.role === "admin" ? "destructive" : "outline"}
      >
        {row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
      </Badge>
    ),
  },
  {
    accessorKey: "addedAt",
    header: "Added At",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: () => (
      <Button className="h-8 w-8" size="icon" variant="ghost">
        <EllipsisVerticalIcon className="h-4 w-4" />
      </Button>
    ),
  },
];

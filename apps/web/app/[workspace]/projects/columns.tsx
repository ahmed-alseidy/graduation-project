"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/projects";

const statusColors: Record<
  Project["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  backlog: "outline",
  planned: "secondary",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
};

const priorityLabels: Record<number, string> = {
  0: "No priority",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};

const priorityColors: Record<
  number,
  "default" | "secondary" | "destructive" | "outline"
> = {
  0: "outline",
  1: "secondary",
  2: "default",
  3: "destructive",
  4: "destructive",
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-md truncate text-muted-foreground text-sm">
        {row.original.description || "-"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusColors[status]}>
          {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <Badge variant={priorityColors[priority] || "outline"}>
          {priorityLabels[priority] || `Level ${priority}`}
        </Badge>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.original.startDate;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.original.endDate;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
];

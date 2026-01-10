"use client"

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useRouter, useParams } from "next/navigation";

export default function Projects() {
  const router = useRouter();
  const params = useParams();
  const workspace = params.workspace as string;

  const membersData = [
    { id: "1", name: "John Doe", health: "Good", priority: "High", lead: "Jane Smith", "target data": "2024-12-31", status: "Active" },
    { id: "2", name: "Jane Smith", health: "Good", priority: "High", lead: "John Doe", "target data": "2024-12-31", status: "Active" },
  ];

  const handleRowClick = (row: any) => {
    router.push(`/${workspace}/projects/${row.original.id}`);
  };

  return (
    <div className="p-0">
      <DataTable columns={columns} data={membersData ?? []} onRowClick={handleRowClick} />
    </div>
  );
}
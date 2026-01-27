"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CreateProjectDialog } from "./_components/create-project-dialog";
import { DataTable } from "@/components/data-table";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { attempt } from "@/lib/error-handling";
import { listProjects } from "@/lib/projects";
import { findWorkspaceBySlug } from "@/lib/workspace";
import { columns } from "./columns";

export default function ProjectsPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.workspace as string);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: workspaceData, isLoading: isWorkspaceLoading } = useQuery({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      const [result, error] = await attempt(findWorkspaceBySlug(slug));
      if (error || !result) {
        toast.error("Error while fetching workspace");
        return null;
      }
      return result?.data.workspace;
    },
    enabled: !!slug,
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects", workspaceData?.id],
    queryFn: async () => {
      if (!workspaceData?.id) {
        return [];
      }

      const [projectsResult, projectsError] = await attempt(
        listProjects(workspaceData.id)
      );
      if (projectsError || !projectsResult) {
        toast.error("Error while fetching projects");
        return [];
      }
      return projectsResult.data.projects;
    },
    enabled: !!slug && !isWorkspaceLoading && !!workspaceData?.id,
  });

  if (isLoading || isWorkspaceLoading) {
    return <Loading />;
  }
  if (true) {
    console.log(projectsData);
  }

  if (!workspaceData?.id) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track your workspace projects
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} />
          New Project
        </Button>
      </div>
      <DataTable columns={columns} data={projectsData ?? []} />
      <CreateProjectDialog
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        workspace={workspaceData}
      />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import IssuesTable from "@/app/[workspace]/_components/issues-table";
import { Loading } from "@/components/loading";
import { attempt } from "@/lib/error-handling";
import { getProjectTasks } from "@/lib/projects";
import { findWorkspaceBySlug } from "@/lib/workspace";

export default function ProjectIssues() {
  const params = useParams();
  const projectId = params.project as string;
  const slug = decodeURIComponent(params.workspace as string);

  const { data: workspaceData, isLoading: isWorkspaceLoading } = useQuery({
    queryKey: ["workspace", slug],
    enabled: !!slug,
    queryFn: async () => {
      const [result, error] = await attempt(findWorkspaceBySlug(slug));
      if (error || !result) {
        toast.error("Error while fetching workspace");
        throw new Error("Failed to fetch workspace");
      }
      return result.data.workspace;
    },
  });

  const { data: projectTaskData, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const [projectTaskResult, projectTaskError] = await attempt(
        getProjectTasks(workspaceData?.id ?? "", projectId)
      );
      if (projectTaskError || !projectTaskResult) {
        toast.error("Error while fetching project tasks");
        throw new Error("Failed to fetch project tasks");
      }
      return projectTaskResult.data.tasks;
    },
    enabled: !!workspaceData?.id && !!projectId,
  });

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div>
      <IssuesTable projectTaskData={projectTaskData} />
    </div>
  );
}

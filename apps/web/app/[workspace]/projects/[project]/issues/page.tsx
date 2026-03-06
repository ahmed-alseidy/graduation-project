"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import IssuesTable from "@/app/[workspace]/_components/issues-table";
import { Loading } from "@/components/loading";
import { currentWorkspaceAtom } from "@/lib/atoms/current-workspace";
import { attempt } from "@/lib/error-handling";
import { getProjectTasks } from "@/lib/projects";

export default function ProjectIssues() {
  const [currentWorkspace] = useAtom(currentWorkspaceAtom);

  const params = useParams();
  const projectId = params.project as string;

  const { data: projectTaskData, isLoading } = useQuery({
    queryKey: ["projectTask", projectId],
    queryFn: async () => {
      const [projectTaskResult, projectTaskError] = await attempt(
        getProjectTasks(currentWorkspace?.id ?? "", projectId)
      );
      if (projectTaskError || !projectTaskResult) {
        toast.error("Error while fetching project tasks");
        throw new Error("Failed to fetch project tasks");
      }
      return projectTaskResult.data.tasks;
    },
    enabled: !!currentWorkspace?.id && !!projectId,
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

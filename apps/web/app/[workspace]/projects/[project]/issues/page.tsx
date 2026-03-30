"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, LayoutDashboard, LayoutList } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import IssuesCalendar from "@/app/[workspace]/_components/issues-calendar";
import IssuesKanban from "@/app/[workspace]/_components/issues-kanban";
import IssuesTable from "@/app/[workspace]/_components/issues-table";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { attempt } from "@/lib/error-handling";
import { getProjectTasks } from "@/lib/projects";
import { findWorkspaceBySlug } from "@/lib/workspace";

type View = "list" | "board" | "calendar";

export default function ProjectIssues() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.project as string;
  const slug = decodeURIComponent(params.workspace as string);
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>("list");

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (
      viewParam === "list" ||
      viewParam === "board" ||
      viewParam === "calendar"
    ) {
      setView(viewParam);
    }
  }, [searchParams]);

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

  if (isWorkspaceLoading || isLoading) {
    return <Loading />;
  }

  function changeView(next: View) {
    setView(next);
    router.replace(`/${slug}/projects/${projectId}/issues?view=${next}`);
  }

  return (
    <div>
      <div className="flex items-center gap-1 border-border border-b px-2 py-1.5">
        <Button
          onClick={() => changeView("list")}
          size="icon"
          title="List view"
          variant={view === "list" ? "secondary" : "ghost"}
        >
          <LayoutList size={16} />
        </Button>
        <Button
          onClick={() => changeView("board")}
          size="icon"
          title="Board view"
          variant={view === "board" ? "secondary" : "ghost"}
        >
          <LayoutDashboard size={16} />
        </Button>
        <Button
          onClick={() => changeView("calendar")}
          size="icon"
          title="Calendar view"
          variant={view === "calendar" ? "secondary" : "ghost"}
        >
          <CalendarDays size={16} />
        </Button>
      </div>

      {view === "list" && <IssuesTable projectTasksData={projectTaskData} />}
      {view === "board" && <IssuesKanban projectTaskData={projectTaskData} />}
      {view === "calendar" && (
        <IssuesCalendar projectTaskData={projectTaskData} />
      )}
    </div>
  );
}

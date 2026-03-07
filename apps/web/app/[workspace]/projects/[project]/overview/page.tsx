"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, Gauge, Signal, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { Textarea } from "@/components/ui/textarea";
import { attempt } from "@/lib/error-handling";
import {
  getProject,
  type ProjectStatus,
  type UpdateProjectData,
  updateProject,
} from "@/lib/projects";
import { findWorkspaceBySlug } from "@/lib/workspace";
import DateSelect from "../../_components/date-select";
import StatusPriority from "../../_components/status-priority";

function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

export default function ProjectOverview() {
  const params = useParams();
  const projectId = params.project as string;
  const slug = decodeURIComponent(params.workspace as string);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<
    ProjectStatus | undefined
  >();
  const [selectedPriority, setSelectedPriority] = useState<
    number | undefined
  >();

  const stateRef = useRef({
    name: projectName,
    description,
    status: selectedStatus,
    priority: selectedPriority,
    startDate,
    targetDate,
  });
  stateRef.current = {
    name: projectName,
    description,
    status: selectedStatus,
    priority: selectedPriority,
    startDate,
    targetDate,
  };

  const isInitialized = useRef(false);

  const queryClient = useQueryClient();

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

  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", workspaceData?.id, projectId],
    enabled: !!workspaceData?.id && !!projectId,
    queryFn: async () => {
      const [result, error] = await attempt(
        getProject(workspaceData?.id ?? "", projectId)
      );
      if (error || !result) {
        toast.error("Failed to load project");
        return null;
      }
      return result.data.project;
    },
  });

  useEffect(() => {
    if (!projectData) {
      return;
    }
    isInitialized.current = false;
    setProjectName(projectData.name);
    setDescription(projectData.description ?? "");
    setSelectedStatus(projectData.status);
    setSelectedPriority(projectData.priority);
    setStartDate(
      projectData.startDate ? new Date(projectData.startDate) : undefined
    );
    setTargetDate(
      projectData.endDate ? new Date(projectData.endDate) : undefined
    );
    setTimeout(() => {
      isInitialized.current = true;
    }, 0);
  }, [projectData]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProjectData) => {
      if (!workspaceData?.id) {
        throw new Error("No workspace selected");
      }
      const [result, error] = await attempt(
        updateProject(workspaceData.id, projectId, data)
      );
      if (error || !result) {
        throw new Error("Failed to update project");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  const buildPayload = (
    overrides: Partial<typeof stateRef.current>
  ): UpdateProjectData => {
    const s = { ...stateRef.current, ...overrides };
    return {
      name: s.name,
      description: s.description || undefined,
      status: s.status,
      priority: s.priority,
      startDate: s.startDate,
      endDate: s.targetDate,
    };
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as ProjectStatus);
    updateMutation.mutate(buildPayload({ status: status as ProjectStatus }));
  };

  const handlePriorityChange = (priority: number) => {
    setSelectedPriority(priority);
    updateMutation.mutate(buildPayload({ priority }));
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    updateMutation.mutate(buildPayload({ startDate: date }));
  };

  const handleTargetDateChange = (date: Date) => {
    setTargetDate(date);
    updateMutation.mutate(buildPayload({ targetDate: date }));
  };

  useEffect(() => {
    if (!isInitialized.current) {
      return;
    }
    if (!projectName) {
      return;
    }

    const savedName = projectName;
    const savedDescription = description;

    const id = setTimeout(() => {
      const s = stateRef.current;
      if (!s.status || s.priority === undefined) {
        return;
      }
      updateMutation.mutate({
        name: savedName,
        description: savedDescription || undefined,
        status: s.status,
        priority: s.priority,
        startDate: s.startDate,
        endDate: s.targetDate,
      });
    }, 1500);

    return () => clearTimeout(id);
  }, [projectName, description, updateMutation.mutate]);

  if (isLoading || isWorkspaceLoading) {
    return <Loading />;
  }

  return (
    <div className="px-8 py-10">
      <Textarea
        className="min-h-12 resize-none border-none bg-background! p-0 font-bold text-2xl! shadow-none focus-visible:ring-0 md:text-3xl"
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Untitled Project"
        rows={1}
        value={projectName}
      />

      <div className="flex flex-col border-b pb-4">
        <PropertyRow
          icon={<Gauge className="size-4" />}
          label="Status & Priority"
        >
          <StatusPriority
            selectedPriority={selectedPriority}
            selectedStatus={selectedStatus}
            setSelectedPriority={handlePriorityChange}
            setSelectedStatus={handleStatusChange}
          />
        </PropertyRow>

        <PropertyRow
          icon={<CalendarRange className="size-4" />}
          label="Timeline"
        >
          <DateSelect
            setStartDate={handleStartDateChange}
            setTargetDate={handleTargetDateChange}
            startDate={startDate}
            targetDate={targetDate}
          />
        </PropertyRow>

        <PropertyRow icon={<User className="size-4" />} label="Lead">
          <span className="text-muted-foreground text-sm">
            No lead assigned
          </span>
        </PropertyRow>

        <PropertyRow icon={<Signal className="size-4" />} label="Progress">
          <span className="text-muted-foreground text-sm">—</span>
        </PropertyRow>
      </div>
      <Textarea
        className="mt-8 min-h-[72px] resize-none border-none bg-background! shadow-none focus-visible:ring-0"
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a project description..."
        value={description}
      />
    </div>
  );
}

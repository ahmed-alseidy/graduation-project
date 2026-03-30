"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AssignUserPopover } from "@/components/assign-user-popover";
import { Loading } from "@/components/loading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { attempt } from "@/lib/error-handling";
import {
  getProject,
  type ProjectStatus,
  type UpdateProjectData,
  updateProject,
} from "@/lib/projects";
import { cn } from "@/lib/utils";
import { findWorkspaceBySlug } from "@/lib/workspace";
import DateSelect from "../../_components/date-select";
import StatusPriority from "../../_components/status-priority";
import { DescriptionEditor } from "./_components/description-editor";

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-[minmax(0,7rem)_1fr] sm:items-start sm:gap-10">
      <div className="pt-0.5 text-[13px] text-muted-foreground leading-none">
        {label}
      </div>
      <div className="min-w-0 text-[13px] text-foreground leading-snug">
        {children}
      </div>
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
  const [selectedLead, setSelectedLead] = useState<string | undefined>();

  const stateRef = useRef({
    name: projectName,
    description,
    status: selectedStatus,
    priority: selectedPriority,
    startDate,
    targetDate,
    leadId: selectedLead,
  });
  stateRef.current = {
    name: projectName,
    description,
    status: selectedStatus,
    priority: selectedPriority,
    startDate,
    targetDate,
    leadId: selectedLead,
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
      queryClient.invalidateQueries({
        queryKey: ["project", workspaceData?.id, projectId],
      });
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
      leadId: s.leadId,
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

  const handleLeadChange = (userId: string | null) => {
    setSelectedLead(userId ?? undefined);
    updateMutation.mutate(buildPayload({ leadId: userId ?? undefined }));
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
        leadId: s.leadId,
      });
    }, 1500);

    return () => clearTimeout(id);
  }, [projectName, description, updateMutation.mutate]);

  if (isLoading || isWorkspaceLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-full bg-background">
      <div className="px-6 py-8 md:px-8 md:py-10">
        <p className="text-muted-foreground text-xs leading-none tracking-wide">
          Overview
        </p>

        <Textarea
          className={cn(
            "mt-3 min-h-12 w-full resize-none border-none bg-transparent! p-0 font-semibold text-2xl! leading-tight shadow-none! ring-0! transition-colors",
            "placeholder:text-muted-foreground/50 focus-visible:ring-0",
            "md:text-3xl! md:leading-tight",
            "[font-family:var(--font-geist-sans),system-ui,sans-serif]"
          )}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          rows={1}
          value={projectName}
        />

        <section aria-label="Project properties" className="mt-2">
          <PropertyRow label="Status">
            <StatusPriority
              selectedPriority={selectedPriority}
              selectedStatus={selectedStatus}
              setSelectedPriority={handlePriorityChange}
              setSelectedStatus={handleStatusChange}
            />
          </PropertyRow>
          <PropertyRow label="Dates">
            <DateSelect
              setStartDate={handleStartDateChange}
              setTargetDate={handleTargetDateChange}
              startDate={startDate}
              targetDate={targetDate}
            />
          </PropertyRow>
          <PropertyRow label="Lead">
            <AssignUserPopover
              currentAssigneeId={projectData?.leadId ?? undefined}
              onAssign={handleLeadChange}
              workspaceId={workspaceData?.id ?? ""}
            />
          </PropertyRow>
          <PropertyRow label="Progress">
            <span className="text-muted-foreground">—</span>
          </PropertyRow>
        </section>

        {projectData ? (
          <section
            aria-label="Description"
            className="mt-10 border-border/80 border-t pt-8"
          >
            <Accordion collapsible defaultValue="description" type="single">
              <AccordionItem value="description">
                <AccordionTrigger>
                  <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-[0.08em]">
                    Description
                  </h2>
                </AccordionTrigger>
                <AccordionContent>
                  <DescriptionEditor
                    description={projectData.description ?? ""}
                    key={projectData.id}
                    setDescription={setDescription}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        ) : null}
      </div>
    </div>
  );
}

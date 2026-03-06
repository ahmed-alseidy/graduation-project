"use client";

import { useAtom } from "jotai";
import {
  Box,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleOff,
  Clock,
  SignalHigh as HighPriority,
  SignalLow as LowPriority,
  SignalMedium as MediumPriority,
  Ellipsis as NoPriority,
  OctagonAlert as UrgentPriority,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { Control } from "react-hook-form";

// biome-ignore lint/suspicious/noExplicitAny: StatusPriority is a generic UI component that works with any form schema
type AnyControl = Control<any>;

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectsDateAtom } from "@/lib/atoms/projects-date";

const defaultPriorityOption = {
  value: 0,
  label: "No priority",
  icon: <NoPriority />,
};

const priorityOptions = [
  defaultPriorityOption,
  { value: 1, label: "Low", icon: <LowPriority /> },
  { value: 2, label: "Medium", icon: <MediumPriority /> },
  { value: 3, label: "High", icon: <HighPriority /> },
  { value: 4, label: "Urgent", icon: <UrgentPriority /> },
];

const statusOptions = [
  {
    value: "backlog",
    label: "Backlog",
    icon: <CircleDashed color="#f2994a" />,
  },
  { value: "planned", label: "Planned", icon: <Circle color="#d7d8db" /> },
  {
    value: "in_progress",
    label: "In Progress",
    icon: <Clock color="#f0bf00" />,
  },
  {
    value: "completed",
    label: "Completed",
    icon: <CheckCircle2 color="#5e6ad2" />,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: <CircleOff color="#8a8f98" />,
  },
] as const;

const defaultStatus = statusOptions[0];
const defaultPriority = defaultPriorityOption;
const PROJECT_ID_REGEX = /\/projects\/([a-f0-9-]+)\/(overview|issues)/;

export default function StatusPriority({
  form,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  showProjectSelector = false,
}: {
  form?: AnyControl;
  selectedStatus?: string;
  setSelectedStatus?: (status: string) => void;
  selectedPriority?: number;
  setSelectedPriority?: (priority: number) => void;
  showProjectSelector?: boolean;
}) {
  const pathname = usePathname();
  const [projectsData] = useAtom(projectsDateAtom);

  const projectIdFromUrl = pathname?.match(PROJECT_ID_REGEX)?.[1] ?? "";

  const renderStatusSelect = () => (
    <Select onValueChange={setSelectedStatus} value={selectedStatus}>
      <SelectTrigger className="h-8 w-auto" size="sm">
        <SelectValue
          placeholder={
            <div className="flex items-center gap-2">
              <span className="size-4">{defaultStatus.icon}</span>
              <span>{defaultStatus.label}</span>
            </div>
          }
        />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <div className="flex items-center gap-2">
              <span className="size-4">{status.icon}</span>
              <span>{status.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderPrioritySelect = () => (
    <Select
      onValueChange={(value) => setSelectedPriority?.(Number(value))}
      value={String(selectedPriority)}
    >
      <SelectTrigger className="h-8 w-auto" size="sm">
        <SelectValue
          placeholder={
            <div className="flex items-center gap-2">
              <span className="size-4">{defaultPriority.icon}</span>
              <span>{defaultPriority.label}</span>
            </div>
          }
        />
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((priority) => (
          <SelectItem key={priority.value} value={String(priority.value)}>
            <div className="flex items-center gap-2">
              <span className="size-4">{priority.icon}</span>
              <span>{priority.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex gap-2">
      {form ? (
        <>
          <FormField
            control={form}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-8 w-auto" size="sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <span className="size-4">{status.icon}</span>
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={String(field.value)}
                  >
                    <SelectTrigger className="h-8 w-auto" size="sm">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem
                          key={priority.value}
                          value={String(priority.value)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="size-4">{priority.icon}</span>
                            <span>{priority.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showProjectSelector ? (
            <FormField
              control={form}
              name="projectId"
              render={({ field }) => {
                const displayValue = field.value || projectIdFromUrl || "";
                return (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={displayValue}
                      >
                        <SelectTrigger className="h-8 w-auto" size="sm">
                          <SelectValue
                            placeholder={
                              <div className="flex items-center gap-2">
                                <Box className="size-4" />
                                <span>Project</span>
                              </div>
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {projectsData?.length ? (
                            projectsData.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-2">
                                  <Box className="size-4" />
                                  <span>{project.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-muted-foreground text-sm">
                              No projects available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          {renderStatusSelect()}
          {renderPrioritySelect()}
        </>
      )}
    </div>
  );
}

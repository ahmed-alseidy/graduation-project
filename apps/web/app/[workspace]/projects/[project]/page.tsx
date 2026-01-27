"use client";

import {
  User
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { currentWorkspaceAtom } from "@/lib/atoms/current-workspace";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { getProject } from "@/lib/projects";
import { attempt } from "@/lib/error-handling";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import StatusPriority from "../_components/status-priority";
import DateSelect from "../_components/date-select";
import * as React from "react";

export default function Project() {
  const params = useParams();
  const projectId = params.project as string;
  const [currentWorkspace, setCurrentWorkspace] = useAtom(currentWorkspaceAtom);
  const [projectName, setProjectName] = useState("");
  const [summary, setSummary] = useState("This is a summary of the project.");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = React.useState<Date>();
  const [targetDate, setTargetDate] = React.useState<Date>();
  const [selectedStatus, setSelectedStatus] = useState();
  const [selectedPriority, setSelectedPriority] = useState();


  const { data: projectData, isLoading } = useQuery({
      queryKey: ["projects", projectId],
      queryFn: async () => {
        if (!projectId) {
          return [];
        }
  
        const [projectResult, projectError] = await attempt(
          getProject(currentWorkspace.id, projectId)
        );
        if (projectError || !projectResult) {
          toast.error("Error while fetching projects");
          return [];
        }
        return projectResult.data.project;
      }
    });

  useEffect(() => {
    if (projectData) {
      console.log(projectData);
      setProjectName(projectData.name);
      setDescription(projectData.description || "");
      setSelectedStatus(projectData.status);
      setSelectedPriority(projectData.priority);
    }
  }, [projectData]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="px-8 py-4">
        <div>
          <Textarea
            className="border-none font-bold text-2xl shadow-none outline-none placeholder:font-bold placeholder:text-2xl focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name..."
            value={projectName}
          />
          <Textarea
            className="border-none shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Add a short summary..."
            value={summary}
          />
        </div>

        <div>
          <div className="flex items-center gap-8">
            <h2 className="font-bold text-lg">Properties</h2>
            <ul className="flex gap-6 font-bold text-sm">
              {/* Status Priority */}
              <StatusPriority selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} selectedPriority={selectedPriority} setSelectedPriority={setSelectedPriority} />
              <li className="flex cursor-pointer items-center gap-2 px-2 py-1 border rounded-md hover:bg-secondary">
                <span>
                  <User className="text-muted-foreground" size={16} />
                </span>
                <span>Abdullah hisham</span>
              </li>
              {/* Date Select */}
              <DateSelect startDate={startDate} setStartDate={setStartDate} targetDate={targetDate} setTargetDate={setTargetDate} />
            </ul>
          </div>
        </div>

        <div>
          <Accordion collapsible type="single">
            <AccordionItem value="item-1">
              <AccordionTrigger className="cursor-pointer font-bold">
                Description
              </AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="border-none font-semibold shadow-none outline-none placeholder:font-bold placeholder:text-2xl focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write project description..."
                  value={description}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <hr />
    </>
  );
}

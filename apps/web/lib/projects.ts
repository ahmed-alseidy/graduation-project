import { authFetch } from "./auth-fetch";
import { BACKEND_URL } from "./constants";

export type ProjectStatus =
  | "backlog"
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: number;
  startDate: Date;
  endDate: Date | null;
  workspaceId: string;
  createdAt: Date | null;
  updatedAt: Date;
};

export const listProjects = async (workspaceId: string) => {
  const res = await authFetch<{ projects: Project[] }>(
    `${BACKEND_URL}/workspaces/${workspaceId}/projects`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export type CreateProjectData = {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: number;
};

export const createProject = async (
  workspaceId: string,
  data: CreateProjectData
) => {
  const res = await authFetch<{ projectId: string }>(
    `${BACKEND_URL}/workspaces/${workspaceId}/projects`,
    {
      method: "POST",
      data,
    }
  );
  return res.data;
};

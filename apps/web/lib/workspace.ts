import { authFetch } from "./auth-fetch";
import { BACKEND_URL } from "./constants";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkspaceMember = {
  id: number;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "admin" | "developer" | "viewer";
  addedAt: Date;
};

export const createWorkspace = async (name: string, slug: string) => {
  const res = await authFetch<{ workspaceId: string }>(
    `${BACKEND_URL}/workspaces`,
    {
      method: "POST",
      data: {
        name,
        slug,
      },
    }
  );
  return res.data;
};

export const findWorkspaceBySlug = async (slug: string) => {
  const res = await authFetch<{ workspace: Workspace }>(
    `${BACKEND_URL}/workspaces/${slug}`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export const listWorkspaces = async () => {
  const res = await authFetch<{ workspaces: Workspace[] }>(
    `${BACKEND_URL}/workspaces`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export const getWorkspaceMembers = async (workspaceId: string) => {
  const res = await authFetch<{ members: WorkspaceMember[] }>(
    `${BACKEND_URL}/workspaces/${workspaceId}/members`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export const addMemberToWorkspace = async (
  workspaceId: string,
  userId: string,
  role: "admin" | "developer" | "viewer"
) => {
  const res = await authFetch<{ success: boolean }>(
    `${BACKEND_URL}/workspaces/${workspaceId}/members`,
    {
      method: "POST",
      data: { userId, role },
    }
  );
  return res.data;
};

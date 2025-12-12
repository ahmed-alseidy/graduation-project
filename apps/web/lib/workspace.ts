import { authFetch } from "./auth-fetch";
import { BACKEND_URL } from "./contants";

export type WorkSpace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
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

export const listWorkspaces = async () => {
  const res = await authFetch<{ workspaces: WorkSpace[] }>(
    `${BACKEND_URL}/workspaces`,
    {
      method: "GET",
    }
  );
  return res.data;
};

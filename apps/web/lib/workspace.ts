import { authFetch } from "./auth-fetch";
import { BACKEND_URL } from "./contants";

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

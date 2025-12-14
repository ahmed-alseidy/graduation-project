"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Loading } from "@/components/loading";
import { attempt } from "@/lib/error-handling";
import { updateWorkspaceAccessedAt } from "@/lib/workspace";
import { WorkspaceLayoutClient } from "./workspace-layout-client";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const params = useParams();
  const slug = decodeURIComponent(params.workspace as string);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function updateWorkspaceAccessedAtEffect() {
      const [result, error] = await attempt(updateWorkspaceAccessedAt(slug));
      if (error) {
        toast.error("Error while updating workspace accessed at");
        return false;
      }
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    }
    updateWorkspaceAccessedAtEffect();
  }, [slug, queryClient]);

  const { session, isLoading } = useAuth();
  if (isLoading) {
    return <Loading />;
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }
  return <WorkspaceLayoutClient>{children}</WorkspaceLayoutClient>;
}

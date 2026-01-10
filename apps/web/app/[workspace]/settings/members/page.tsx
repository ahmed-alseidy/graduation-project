"use client";

import { useQuery } from "@tanstack/react-query";
import { MailIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { attempt } from "@/lib/error-handling";
import { findWorkspaceBySlug, getWorkspaceMembers } from "@/lib/workspace";
import { columns } from "./columns";
import { InviteForm } from "./invite-form";

export default function MembersPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.workspace as string);
  const { data: workspaceData, isLoading: isWorkspaceLoading } = useQuery({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      const [result, error] = await attempt(findWorkspaceBySlug(slug));
      if (error || !result) {
        toast.error("Error while fetching workspace");
        return null;
      }
      return result?.data.workspace;
    },
    enabled: !!slug,
  });

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["workspace-members", workspaceData?.id],
    queryFn: async () => {
      if (!workspaceData?.id) {
        return [];
      }

      const [membersResult, membersError] = await attempt(
        getWorkspaceMembers(workspaceData.id)
      );
      if (membersError || !membersResult) {
        return [];
      }
      return membersResult.data.members;
    },
    enabled: !!slug && !isWorkspaceLoading,
  });
  if (true) {
    console.log("membersData", membersData);
  }

  if (isLoading || isWorkspaceLoading) {
    return <Loading />;
  }

  if (!workspaceData?.id) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Members</h1>
          <p className="text-muted-foreground text-sm">
            Manage workspace members and their permissions
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <MailIcon className="mr-1 size-4" />
              Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Members</DialogTitle>
              <DialogDescription>
                Invite new members to the workspace by entering their email
                addresses.
              </DialogDescription>
            </DialogHeader>
            <InviteForm workspaceId={workspaceData?.id ?? ""} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={membersData ?? []} />
    </div>
  );
}

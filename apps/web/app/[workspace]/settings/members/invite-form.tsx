"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { attempt } from "@/lib/error-handling";
import { addMemberToWorkspace } from "@/lib/workspace";

const schema = z.object({
  emails: z
    .string()
    .min(1, "At least one email is required")
    .refine(
      (value) => {
        const emails = value
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
        return emails.every((email) => z.email().safeParse(email).success);
      },
      {
        message: "Please enter valid email addresses separated by commas",
      }
    ),
});

type InviteFormValues = z.infer<typeof schema>;

export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      emails: "",
    },
  });

  async function onSubmit(data: InviteFormValues) {
    const [, error] = await attempt(
      addMemberToWorkspace(
        workspaceId,
        data.emails.split(",").map((email) => email.trim())
      )
    );
    if (error) {
      toast.error("Failed to invite members");
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["workspace-members", workspaceId],
    });
    toast.success("Members invited successfully");
    form.reset();
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email addresses</FormLabel>
              <FormControl>
                <Input
                  placeholder="user@example.com, another@example.com"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter email addresses separated by commas to invite multiple
                users
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Send Invitations
        </Button>
      </form>
    </Form>
  );
}

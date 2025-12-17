"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { currentWorkspaceAtom } from "@/lib/atoms/current-workspace";
import { authClient } from "@/lib/auth-client";
import { attempt } from "@/lib/error-handling";
import { listWorkspaces } from "@/lib/workspace";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const setCurrentWorkspace = useSetAtom(currentWorkspaceAtom);
  const router = useRouter();
  const auth = authClient.useSession();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const [result, error] = await attempt(listWorkspaces(1, 1));
      if (error || !result) {
        return { workspaces: [], total: 0 };
      }
      if (result.data.workspaces.length > 0) {
        setCurrentWorkspace(result.data.workspaces[0]);
      }
      return result.data;
    },
    enabled:
      !!auth.data?.session?.expiresAt &&
      auth.data.session.expiresAt > new Date(),
  });

  useEffect(() => {
    if (
      auth.data?.session?.expiresAt &&
      auth.data.session.expiresAt > new Date() &&
      workspacesData?.workspaces &&
      workspacesData.workspaces.length > 0
    ) {
      router.push(
        `/${encodeURIComponent(workspacesData.workspaces[0]?.slug ?? "")}`
      );
    }
  }, [auth.data?.session?.expiresAt, workspacesData, router]);

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(data: z.infer<typeof schema>) {
    const res = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    if (res?.error) {
      form.setError("root", { message: res?.error.message });
    } else {
      const [result, error] = await attempt(listWorkspaces(1, 1));
      if (error || !result) {
        form.setError("root", {
          message: "Failed to fetch workspaces. Please try again.",
        });
        return;
      }
      if (result?.data.workspaces.length >= 1) {
        router.push(
          `/${encodeURIComponent(result.data.workspaces[0]?.slug ?? "")}`
        );
      } else {
        router.push("/workspaces/new");
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {form.formState.errors.root?.message ? (
                <p className="text-center text-destructive text-sm">
                  {form.formState.errors.root?.message}
                </p>
              ) : null}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="email"
                        placeholder="m@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{ required: "Email is required" }}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <a
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                        href="/forgot-password"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        autoComplete="current-password"
                        placeholder="Password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{ required: "Password is required" }}
              />
              <Button
                className="w-full"
                disabled={isSubmitting || !isValid}
                type="submit"
              >
                {isSubmitting ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a className="underline underline-offset-4" href="/register">
                  Sign up
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking login, you agree to our{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  );
}

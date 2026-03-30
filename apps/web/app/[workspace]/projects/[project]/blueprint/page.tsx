"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  FileCode2,
  GitBranch,
  Layers,
  ScrollText,
  Sparkles,
  Tag,
} from "lucide-react";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { BACKEND_URL } from "@/lib/constants";
import { attempt } from "@/lib/error-handling";
import { cn } from "@/lib/utils";
import { findWorkspaceBySlug } from "@/lib/workspace";
import {
  type BlueprintStep,
  GenerationProgress,
} from "./_components/generation-progress";

const blueprintDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--blueprint-display",
  display: "swap",
});

const blueprintUi = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--blueprint-ui",
  display: "swap",
});

const schema = z.object({
  description: z
    .string()
    .min(30, "Please provide at least 30 characters describing your idea")
    .max(5000, "Please provide at most 5000 characters describing your idea"),
});

type FormValues = z.infer<typeof schema>;

const BLUEPRINT_OUTPUTS = [
  {
    icon: Brain,
    label: "Market feasibility analysis",
    description: "Scores across 6 dimensions",
    index: "01",
  },
  {
    icon: Layers,
    label: "Core features",
    description: "AI-identified product features",
    index: "02",
  },
  {
    icon: FileCode2,
    label: "PostgreSQL DDL schema",
    description: "Ready-to-use database schema",
    index: "03",
  },
  {
    icon: GitBranch,
    label: "Tech stack recommendations",
    description: "Frontend, backend, DB & AI",
    index: "04",
  },
  {
    icon: Tag,
    label: "Pricing model & user flow",
    description: "Tiers and interactive diagram",
    index: "05",
  },
] as const;

export default function BlueprintInputPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.project as string;
  const workspaceSlug = decodeURIComponent(params.workspace as string);

  const workspaceData = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const [result, error] = await attempt(findWorkspaceBySlug(workspaceSlug));
      if (error || !result) {
        toast.error("Error while fetching workspace");
      }
      return result?.data.workspace;
    },
    enabled: !!workspaceSlug,
  });

  const workspaceId = workspaceData.data?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: "" },
    mode: "onChange",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState<BlueprintStep | undefined>();

  const descriptionLength = form.watch("description").length;
  const progressPct = Math.min((descriptionLength / 30) * 100, 100);

  async function onSubmit(values: FormValues) {
    if (isGenerating) {
      return;
    }
    setIsGenerating(true);
    setActiveStep("Analyzing project description");

    try {
      const url = new URL(
        `${BACKEND_URL}/workspaces/${workspaceId}/projects/${projectId}/blueprint/generate`
      );
      url.searchParams.set("description", values.description);

      const eventSource = new EventSource(url.toString(), {
        withCredentials: true,
      });

      eventSource.addEventListener("progress", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as {
            step?: BlueprintStep;
            status?: "in_progress" | "completed";
          };
          if (data.step) {
            setActiveStep(data.step);
          }
        } catch {
          // best-effort parsing; ignore malformed messages
        }
      });

      eventSource.addEventListener("done", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as {
            done?: boolean;
            blueprintId?: string;
          };
          if (data.done && data.blueprintId) {
            eventSource.close();
            router.push(
              `/${workspaceSlug}/projects/${projectId}/blueprint/review`
            );
          }
        } catch {
          eventSource.close();
          setIsGenerating(false);
          toast.error("Error while finishing blueprint generation");
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
        setIsGenerating(false);
        toast.error("Error while generating blueprint");
      };
    } catch {
      toast.error("Error while starting blueprint generation");
      setIsGenerating(false);
    }
  }

  if (!(workspaceId && projectId)) {
    return <Loading />;
  }

  return (
    <div
      className={cn(
        blueprintDisplay.variable,
        blueprintUi.variable,
        "relative isolate min-h-[min(100vh,920px)] w-full overflow-hidden"
      )}
      style={{ fontFamily: "var(--blueprint-ui), system-ui, sans-serif" }}
    >
      <div aria-hidden className="pointer-events-none absolute" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:gap-12 md:px-6 md:py-12 lg:py-16">
        {/* Vertical spine — large viewports only */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-24 bottom-32 left-0 hidden font-mono text-[10px] text-muted-foreground/25 uppercase tracking-[0.35em] [writing-mode:vertical-rl] lg:block xl:left-2"
        >
          Spec sheet · v1
        </div>

        <header className="motion-safe:fade-in motion-safe:slide-in-from-bottom-2 relative flex flex-col gap-6 motion-safe:animate-in motion-safe:duration-700 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-primary/25 bg-primary/6 px-2.5 py-1 font-mono text-[10px] text-primary uppercase tracking-[0.18em]">
                <span
                  aria-hidden
                  className="size-1.5 animate-pulse rounded-full bg-primary"
                />
                Live spec
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                Generator
              </span>
            </div>

            <h1
              className="text-balance text-4xl text-foreground leading-[1.05] tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--blueprint-display), serif" }}
            >
              Turn a paragraph into a product blueprint.
            </h1>

            <p className="max-w-md text-[15px] text-muted-foreground leading-relaxed md:text-base">
              One pass produces market fit signals, feature slices, stack picks,
              DDL, and pricing flow — tuned from how you describe the idea.
            </p>
          </div>

          <Button
            asChild
            className="h-11 w-full shrink-0 gap-2 self-stretch border-foreground/15 bg-background/60 font-medium shadow-none backdrop-blur-sm transition-colors hover:bg-foreground/4 md:h-10 md:w-auto"
            size="sm"
            variant="outline"
          >
            <Link
              href={`/${workspaceSlug}/projects/${projectId}/blueprint/review`}
            >
              <ScrollText className="size-4 opacity-70" />
              Open existing blueprint
            </Link>
          </Button>
        </header>

        <div
          aria-hidden
          className="motion-safe:fade-in motion-safe:slide-in-from-bottom-1 flex items-center gap-4 motion-safe:animate-in motion-safe:fill-mode-both motion-safe:delay-100 motion-safe:duration-700"
        >
          <div className="h-px flex-1" />
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.25em]">
            Input
          </span>
          <div className="h-px w-12 bg-foreground/15" />
        </div>

        <Form {...form}>
          <form
            className="motion-safe:fade-in motion-safe:slide-in-from-bottom-3 grid gap-8 motion-safe:animate-in motion-safe:fill-mode-both motion-safe:delay-150 motion-safe:duration-700 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] md:gap-10 lg:items-start"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Editor column */}
            <div className="relative flex flex-col">
              <div
                aria-hidden
                className="-inset-px pointer-events-none absolute border border-foreground/10 bg-linear-to-br from-card/80 via-background/40 to-transparent dark:from-card/50"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute top-3 left-3 size-2 border-foreground/20 border-t border-l"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute top-3 right-3 size-2 border-foreground/20 border-t border-r"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-3 left-3 size-2 border-foreground/20 border-b border-l"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute right-3 bottom-3 size-2 border-foreground/20 border-r border-b"
              />

              <div className="relative border border-foreground/10 bg-card/30 shadow-[0_24px_80px_-32px_oklch(0.3_0.08_264/0.35)] backdrop-blur-[2px] dark:bg-card/15 dark:shadow-[0_28px_90px_-28px_oklch(0.15_0.06_264/0.5)]">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="gap-0 space-y-0">
                      <div className="flex items-center justify-between border-foreground/10 border-b bg-foreground/2 px-3 py-2 dark:bg-foreground/3">
                        <span className="font-mono text-[10px] text-muted-foreground tracking-wide">
                          idea_description.txt
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[10px] tabular-nums tracking-wide transition-colors duration-300",
                            descriptionLength === 0 &&
                              "text-muted-foreground/40",
                            descriptionLength > 0 &&
                              descriptionLength < 30 &&
                              "text-[oklch(0.55_0.12_75)] dark:text-[oklch(0.78_0.12_85)]",
                            descriptionLength >= 30 &&
                              "text-[oklch(0.48_0.12_160)] dark:text-[oklch(0.72_0.12_160)]"
                          )}
                        >
                          {descriptionLength < 30
                            ? `${descriptionLength} / 30 min`
                            : `${descriptionLength} chars`}
                        </span>
                      </div>

                      <FormControl>
                        <Textarea
                          className={cn(
                            "min-h-[260px] resize-none border-0 bg-transparent px-3 py-3 font-mono text-[13px] leading-relaxed",
                            "placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0",
                            "transition-shadow focus-visible:shadow-[inset_0_0_0_1px_oklch(0.488_0.243_264.376/0.45)] dark:focus-visible:shadow-[inset_0_0_0_1px_oklch(0.55_0.18_266/0.5)]"
                          )}
                          disabled={isGenerating}
                          placeholder={
                            "// Who is this for?\n// What breaks today?\n// What must ship in v1?\n// Hard constraints (stack, compliance, budget)?"
                          }
                          {...field}
                        />
                      </FormControl>

                      <div className="h-0.5 w-full overflow-hidden bg-foreground/10">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 ease-out",
                            descriptionLength < 30
                              ? "bg-[oklch(0.58_0.14_75)]"
                              : "bg-[oklch(0.52_0.14_160)]"
                          )}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <FormMessage className="px-3 py-2 text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 border-foreground/10 border-t bg-foreground/2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-foreground/2.5">
                  <p className="text-[11px] text-muted-foreground/70 leading-snug">
                    Richer briefs yield sharper schemas and stack choices.
                  </p>
                  <Button
                    className="h-10 gap-2 font-medium shadow-[0_1px_0_0_oklch(0.2_0.02_264/0.15)] transition-transform active:scale-[0.98]"
                    disabled={isGenerating || !form.formState.isValid}
                    type="submit"
                  >
                    <Sparkles className="size-4" />
                    {isGenerating ? "Generating…" : "Generate blueprint"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Manifest / progress */}
            {isGenerating ? (
              <GenerationProgress activeStep={activeStep} />
            ) : (
              <div className="relative flex max-h-fit flex-col overflow-hidden border border-foreground/10 bg-card/40 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] backdrop-blur-[2px] dark:bg-card/25 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent 0%, transparent 49%, oklch(0.5 0.08 250 / 0.05) 50%, transparent 51%),
                      linear-gradient(0deg, transparent 0%, transparent 49%, oklch(0.5 0.08 250 / 0.05) 50%, transparent 51%)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative flex items-center justify-between border-foreground/10 border-b bg-foreground/3 px-3 py-2 dark:bg-foreground/4">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Deliverables
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                    05
                  </span>
                </div>

                <div className="relative flex flex-col divide-y divide-foreground/8">
                  {BLUEPRINT_OUTPUTS.map(
                    ({ icon: Icon, label, description, index }, i) => (
                      <div
                        className="group relative flex items-start gap-3 px-3 py-3.5 transition-colors duration-300 hover:bg-foreground/3"
                        key={label}
                        style={{
                          animationDelay: `${i * 45}ms`,
                        }}
                      >
                        <span
                          className="mt-0.5 shrink-0 font-mono text-[10px] text-muted-foreground/45 tabular-nums"
                          style={{
                            fontFamily: "var(--blueprint-display), serif",
                          }}
                        >
                          {index}
                        </span>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-foreground/10 bg-background/50 transition-colors group-hover:border-primary/25 group-hover:bg-primary/6">
                          <Icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="font-medium text-[13px] leading-snug tracking-tight">
                            {label}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="relative border-foreground/10 border-t border-dashed px-3 py-3">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Note —</span>{" "}
                    Name your audience, the job-to-be-done, and non-negotiables
                    for the strongest first draft.
                  </p>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

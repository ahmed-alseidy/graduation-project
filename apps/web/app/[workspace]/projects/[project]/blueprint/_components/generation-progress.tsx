"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Analyzing project description",
  "Evaluating market feasibility",
  "Identifying core features",
  "Determining technical requirements",
  "Generating database schema (DDL)",
  "Creating user flow diagram",
  "Finalizing blueprint",
] as const;

export type BlueprintStep = (typeof STEPS)[number];

export type BlueprintProgressEvent =
  | { step: BlueprintStep; status: "in_progress" | "completed" }
  | { done: true; blueprintId: string };

type GenerationProgressProps = {
  activeStep?: BlueprintStep;
};

function getStatusLabel(isIdle: boolean, isLastStep: boolean): string {
  if (isIdle) {
    return "idle";
  }
  if (isLastStep) {
    return "finalizing";
  }
  return "in_progress";
}

function getStatusText(isIdle: boolean, isLastStep: boolean): string {
  if (isIdle) {
    return "Awaiting input…";
  }
  if (isLastStep) {
    return "Wrapping up your blueprint…";
  }
  return "AI is working on your blueprint…";
}

function StepIcon({
  isCompleted,
  isActive,
}: {
  isCompleted: boolean;
  isActive: boolean;
}) {
  if (isCompleted) {
    return (
      <CheckCircle2 className="size-3.5 text-[oklch(0.55_0.14_160)] dark:text-[oklch(0.72_0.14_160)]" />
    );
  }
  if (isActive) {
    return <Loader2 className="size-3.5 animate-spin text-primary" />;
  }
  return <div className="size-3 border border-foreground/15 bg-foreground/2" />;
}

export function GenerationProgress({ activeStep }: GenerationProgressProps) {
  const activeIndex = activeStep ? STEPS.indexOf(activeStep) : -1;
  const isIdle = !activeStep;
  const isLastStep = activeIndex === STEPS.length - 1;
  const completedCount = activeIndex < 0 ? 0 : activeIndex;

  function getStatusColorClass(): string {
    if (isIdle) {
      return "text-muted-foreground/50";
    }
    if (isLastStep) {
      return "animate-pulse text-primary";
    }
    return "animate-pulse text-[oklch(0.55_0.12_75)] dark:text-[oklch(0.78_0.12_85)]";
  }
  const statusColorClass = getStatusColorClass();

  return (
    <div className="relative flex flex-col overflow-hidden border border-foreground/10 bg-card/40 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] backdrop-blur-[2px] dark:bg-card/25 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, transparent 49%, oklch(0.5 0.08 250 / 0.06) 50%, transparent 51%),
            linear-gradient(0deg, transparent 0%, transparent 49%, oklch(0.5 0.08 250 / 0.06) 50%, transparent 51%)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex items-center justify-between border-foreground/10 border-b bg-foreground/3 px-3 py-2 dark:bg-foreground/4">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          Run log
        </span>
        <span
          className={cn(
            "font-mono text-[10px] tracking-wide transition-colors",
            statusColorClass
          )}
        >
          {getStatusLabel(isIdle, isLastStep)}
        </span>
      </div>

      <div className="relative flex flex-col divide-y divide-foreground/8">
        {STEPS.map((step, index) => {
          const isActive = activeStep === step;
          const isCompleted = activeIndex > index;
          const isPending = !(isActive || isCompleted);
          const stepNum = String(index + 1).padStart(2, "0");

          return (
            <div
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 transition-colors duration-300",
                isCompleted
                  ? "bg-[oklch(0.55_0.12_160/0.06)] dark:bg-[oklch(0.55_0.12_160/0.1)]"
                  : "",
                isActive ? "bg-primary/7" : "",
                isPending ? "opacity-45" : ""
              )}
              key={step}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-0 w-0.5 bg-primary"
                />
              ) : null}
              <span className="w-5 shrink-0 font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                {stepNum}
              </span>

              <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                <StepIcon isActive={isActive} isCompleted={isCompleted} />
              </div>

              <span
                className={cn(
                  "text-[11px] transition-colors duration-300",
                  isCompleted
                    ? "text-[oklch(0.42_0.1_160)] dark:text-[oklch(0.78_0.1_160)]"
                    : "",
                  isActive ? "font-medium text-foreground" : "",
                  isPending ? "text-muted-foreground" : ""
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative mt-auto space-y-2 border-foreground/10 border-t border-dashed px-3 py-3">
        <div className="h-0.5 w-full overflow-hidden bg-foreground/10">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{
              width: `${(completedCount / STEPS.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {getStatusText(isIdle, isLastStep)}
        </p>
      </div>
    </div>
  );
}

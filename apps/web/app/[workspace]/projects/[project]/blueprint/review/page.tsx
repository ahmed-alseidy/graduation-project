"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  ChevronRight,
  ClipboardCopy,
  GitBranch,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { convertBlueprintToTasks, getBlueprint } from "@/lib/blueprint";
import { attempt } from "@/lib/error-handling";
import { cn } from "@/lib/utils";
import { findWorkspaceBySlug } from "@/lib/workspace";

export default function BlueprintReviewPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = decodeURIComponent(params.workspace as string);
  const projectId = params.project as string;

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["blueprint", workspaceId, projectId],
    queryFn: async () => {
      const [result, error] = await attempt(
        getBlueprint(workspaceId ?? "", projectId)
      );
      if (error) {
        toast.error("Failed to load blueprint");
        throw error;
      }
      return result ?? null;
    },
    enabled: !!workspaceId && !!projectId,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 py-10">
        <div className="flex h-10 w-10 items-center justify-center border bg-muted">
          <Sparkles className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">No blueprint yet</p>
          <p className="text-muted-foreground text-sm">
            Generate an AI blueprint to get market analysis, features, and a
            full tech plan for this project.
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/${workspaceId}/projects/${projectId}/blueprint`)
          }
          size="sm"
        >
          <Sparkles className="mr-1.5 size-3.5" />
          Generate blueprint
        </Button>
      </div>
    );
  }

  const blueprint = data.blueprint;
  const feasibility = blueprint.feasibility;
  const overallScore = feasibility.overallScore;
  const scoreColor = getScoreTextColor(overallScore);

  async function handleConvertToTasks() {
    const [result, error] = await attempt(
      convertBlueprintToTasks(workspaceId ?? "", projectId)
    );
    if (error || !result) {
      toast.error("Failed to convert features into tasks");
      return;
    }
    toast.success(`Created ${result.data.created} tasks from core features`);
  }

  const feasibilityMetrics = [
    { label: "Uniqueness", value: feasibility.uniqueness },
    { label: "Stickiness", value: feasibility.stickiness },
    { label: "Growth Trend", value: feasibility.growthTrend },
    { label: "Pricing Potential", value: feasibility.pricingPotential },
    { label: "Upsell Potential", value: feasibility.upsellPotential },
    { label: "Customer Power", value: feasibility.customerPurchasingPower },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* ── MASTHEAD ─────────────────────────────────────────────── */}
      <header className="border-b pt-2 pb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
            Blueprint
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
            Review
          </span>
        </div>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 font-bold text-2xl tracking-tight">
              {blueprint.projectName}
            </h1>
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              {blueprint.summary}
            </p>
          </div>

          <div className="min-w-[88px] shrink-0 border p-4 text-center">
            <div
              className={cn(
                "font-bold text-4xl tabular-nums leading-none",
                scoreColor
              )}
            >
              {overallScore.toFixed(1)}
            </div>
            <div className="mt-1.5 text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
              Feasibility
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button className="gap-1.5" onClick={handleConvertToTasks} size="sm">
            <CheckSquare className="size-3.5" />
            Convert to tasks
          </Button>
          <Button
            className="gap-1.5"
            onClick={() =>
              router.push(
                `/${workspaceSlug}/projects/${projectId}/blueprint/flow`
              )
            }
            size="sm"
            variant="outline"
          >
            <GitBranch className="size-3.5" />
            View user flow
            <ChevronRight className="size-3.5 opacity-50" />
          </Button>
          <Button
            className="ml-auto gap-1.5"
            onClick={() => refetch()}
            size="sm"
            variant="ghost"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </header>

      {/* ── 01 — MARKET FEASIBILITY ───────────────────────────────── */}
      <SectionHeader label="Market Feasibility" number="01" />
      <div className="border-b py-5">
        <div className="space-y-3">
          {feasibilityMetrics.map(({ label, value }) => (
            <ScoreRow key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      {/* ── 02 — IMPROVEMENT SUGGESTIONS ─────────────────────────── */}
      <SectionHeader label="Improvement Suggestions" number="02" />
      <div className="border-b py-1">
        <ul>
          {blueprint.improvementSuggestions.map((item, index) => (
            <li
              className="flex gap-4 border-b py-3 last:border-b-0"
              key={index.toString()}
            >
              <span className="w-6 shrink-0 pt-0.5 text-right font-bold text-[10px] text-muted-foreground/40 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-sm leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 03 — CORE FEATURES ───────────────────────────────────── */}
      <SectionHeader label="Core Features" number="03" />
      <div className="border-b py-1">
        <ul>
          {blueprint.coreFeatures.map((feature, index) => (
            <li
              className="flex gap-4 border-b py-3.5 last:border-b-0"
              key={index.toString()}
            >
              <span className="w-6 shrink-0 pt-0.5 text-right font-bold text-[10px] text-muted-foreground/40 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="mb-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
                  {feature.title}
                </p>
                <p className="text-sm leading-relaxed">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 04 — TECH STACK ──────────────────────────────────────── */}
      <SectionHeader label="Recommended Tech Stack" number="04" />
      <div className="border-b py-5">
        <div className="space-y-3">
          <StackRow
            color="blue"
            items={blueprint.techStack.frontend}
            label="Frontend"
          />
          <StackRow
            color="violet"
            items={blueprint.techStack.backend}
            label="Backend"
          />
          <StackRow
            color="orange"
            items={blueprint.techStack.database}
            label="Database"
          />
          <StackRow
            color="pink"
            items={blueprint.techStack.ai}
            label="AI & Tooling"
          />
        </div>
      </div>

      {/* ── 05 — PRICING MODEL ───────────────────────────────────── */}
      <SectionHeader label="Pricing Model" number="05" />
      <div className="border-b py-5">
        <div
          className="grid gap-px bg-border"
          style={{
            gridTemplateColumns: `repeat(${blueprint.pricingModel.length}, minmax(0, 1fr))`,
          }}
        >
          {blueprint.pricingModel.map((tier, index) => (
            <div
              className={cn("bg-background p-4", index === 1 && "bg-primary/5")}
              key={index.toString()}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                    {tier.tier}
                  </div>
                  <div className="mt-0.5 font-bold text-lg tabular-nums">
                    {tier.price}
                  </div>
                </div>
                {index === 1 && (
                  <span className="border border-primary/40 px-1.5 py-0.5 font-semibold text-[9px] text-primary uppercase tracking-[0.15em]">
                    Popular
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {tier.features.map((f, i) => (
                  <li
                    className="flex items-start gap-2 text-muted-foreground text-xs"
                    key={i.toString()}
                  >
                    <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── 06 — DATABASE SCHEMA ─────────────────────────────────── */}
      <SectionHeader label="Database Schema (PostgreSQL DDL)" number="06" />
      <div className="border-b py-5">
        <div className="mb-3 flex justify-end">
          <Button
            className="gap-1.5"
            onClick={async () => {
              await navigator.clipboard.writeText(blueprint.ddl);
              toast.success("DDL copied to clipboard");
            }}
            size="sm"
            variant="outline"
          >
            <ClipboardCopy className="size-3.5" />
            Copy DDL
          </Button>
        </div>
        <div className="max-h-[480px] overflow-auto border bg-muted/30">
          <table className="w-full font-mono text-xs">
            <tbody>
              {blueprint.ddl.split("\n").map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: DDL lines have no stable identifier
                <tr className="group hover:bg-muted/60" key={`ddl-line-${i}`}>
                  <td className="w-10 select-none border-border/40 border-r py-0.5 pr-4 pl-3 text-right text-muted-foreground/30 tabular-nums group-hover:text-muted-foreground/50">
                    {i + 1}
                  </td>
                  <td className="whitespace-pre py-0.5 pr-3 pl-4 text-foreground/85">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-end gap-2 py-5">
        <Button
          className="gap-1.5"
          onClick={() =>
            router.push(`/${workspaceSlug}/projects/${projectId}/issues`)
          }
          size="sm"
          variant="outline"
        >
          Go to task board
          <ChevronRight className="size-3.5 opacity-50" />
        </Button>
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="shrink-0 font-bold text-[10px] text-muted-foreground/40 tabular-nums tracking-widest">
        {number}
      </span>
      <div className="h-3 w-px bg-border" />
      <h2 className="shrink-0 font-semibold text-[10px] uppercase tracking-[0.2em]">
        {label}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─── Score Row ────────────────────────────────────────────────────────────────

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 10) * 100);

  return (
    <div className="flex items-center gap-4">
      <div className="w-36 shrink-0 text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="h-1 flex-1 overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-700",
            getScoreBarColor(value)
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "w-8 shrink-0 text-right font-bold text-xs tabular-nums",
          getScoreValueTextColor(value)
        )}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Stack Row ────────────────────────────────────────────────────────────────

type StackColor = "blue" | "violet" | "orange" | "pink";

const STACK_COLORS: Record<StackColor, { badge: string; label: string }> = {
  blue: {
    badge:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    label: "text-blue-600 dark:text-blue-400",
  },
  violet: {
    badge:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    label: "text-violet-600 dark:text-violet-400",
  },
  orange: {
    badge:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    label: "text-orange-600 dark:text-orange-400",
  },
  pink: {
    badge:
      "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    label: "text-pink-600 dark:text-pink-400",
  },
};

function StackRow({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: StackColor;
}) {
  if (!items.length) {
    return null;
  }
  const colors = STACK_COLORS[color];
  return (
    <div className="flex items-baseline gap-4">
      <div
        className={cn(
          "w-24 shrink-0 font-semibold text-[10px] uppercase tracking-[0.15em]",
          colors.label
        )}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            className={cn(
              "border px-2 py-0.5 font-medium text-[11px]",
              colors.badge
            )}
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Score Helpers ────────────────────────────────────────────────────────────

function getScoreBarColor(value: number): string {
  if (value >= 7) {
    return "bg-emerald-500";
  }
  if (value >= 5) {
    return "bg-amber-500";
  }
  return "bg-red-500";
}

function getScoreTextColor(value: number): string {
  if (value >= 7) {
    return "text-emerald-500";
  }
  if (value >= 5) {
    return "text-amber-500";
  }
  return "text-red-500";
}

function getScoreValueTextColor(value: number): string {
  if (value >= 7) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (value >= 5) {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-red-600 dark:text-red-400";
}

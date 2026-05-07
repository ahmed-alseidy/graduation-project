import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { ok } from "@/common/response";
import { db } from "@/db";
import {
  cycles,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import { attempt } from "@/lib/error-handling";
import { UpdateCycleDto } from "./dto/update-cycle.dto";
import { UpdateCycleSettingsDto } from "./dto/update-cycle-settings.dto";

const DAY_MS = 1000 * 60 * 60 * 24;

type CycleKind = "current" | "upcoming";

@Injectable()
export class CyclesService {
  private startOfUtcDay(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * DAY_MS);
  }

  private async getMembership(workspaceId: string, userId: string) {
    const [membership, error] = await attempt(
      db
        .select({
          role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1)
    );

    if (error) {
      throw new InternalServerErrorException(
        "Failed to check workspace access"
      );
    }

    if (!membership?.[0]) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    return membership[0];
  }

  private async requireAdmin(workspaceId: string, userId: string) {
    const membership = await this.getMembership(workspaceId, userId);
    if (membership.role !== "admin") {
      throw new ForbiddenException(
        "You are not authorized to manage cycles in this workspace"
      );
    }
    return membership;
  }

  private async getWorkspaceSettings(workspaceId: string) {
    const [workspace, error] = await attempt(
      db
        .select({
          id: workspaces.id,
          cyclesEnabled: workspaces.cyclesEnabled,
          cycleLengthDays: workspaces.cycleLengthDays,
          cyclesStartDate: workspaces.cyclesStartDate,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1)
    );

    if (error) {
      throw new InternalServerErrorException("Failed to get cycle settings");
    }

    if (!workspace?.[0]) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace[0];
  }

  private getCycleWindow(startDate: Date, lengthDays: number, kind: CycleKind) {
    const anchor = this.startOfUtcDay(startDate);
    const today = this.startOfUtcDay(new Date());

    if (today.getTime() < anchor.getTime()) {
      if (kind === "current") {
        return null;
      }
      return {
        index: 0,
        startDate: anchor,
        endDate: this.addDays(anchor, lengthDays),
      };
    }

    const currentIndex = Math.floor(
      (today.getTime() - anchor.getTime()) / (lengthDays * DAY_MS)
    );
    const index = kind === "current" ? currentIndex : currentIndex + 1;
    const cycleStart = this.addDays(anchor, index * lengthDays);

    return {
      index,
      startDate: cycleStart,
      endDate: this.addDays(cycleStart, lengthDays),
    };
  }

  private async getOrCreateCycle(
    workspaceId: string,
    index: number,
    startDate: Date,
    endDate: Date
  ) {
    const [foundCycle, foundCycleError] = await attempt(
      db
        .select()
        .from(cycles)
        .where(
          and(
            eq(cycles.workspaceId, workspaceId),
            eq(cycles.startDate, startDate)
          )
        )
        .limit(1)
    );

    if (foundCycleError) {
      throw new InternalServerErrorException("Failed to get cycle");
    }

    if (foundCycle?.[0]) {
      return foundCycle[0];
    }

    const [createdCycle, createCycleError] = await attempt(
      db
        .insert(cycles)
        .values({
          workspaceId,
          name: `Cycle ${index + 1}`,
          startDate,
          endDate,
        })
        .returning()
    );

    if (createCycleError) {
      throw new InternalServerErrorException("Failed to create cycle");
    }

    return createdCycle?.[0];
  }

  private async getCycleTasks(cycleId: string) {
    const [taskList, taskListError] = await attempt(
      db
        .select({
          id: tasks.id,
          name: tasks.name,
          description: tasks.description,
          projectId: tasks.projectId,
          workspaceId: tasks.workspaceId,
          assigneeId: tasks.assigneeId,
          assigneeName: users.name,
          assigneeEmail: users.email,
          status: tasks.status,
          dueDate: tasks.dueDate,
          priority: tasks.priority,
          cycleId: tasks.cycleId,
          createdAt: tasks.createdAt,
        })
        .from(tasks)
        .where(eq(tasks.cycleId, cycleId))
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .orderBy(desc(tasks.priority), desc(tasks.createdAt))
    );

    if (taskListError) {
      throw new InternalServerErrorException("Failed to get cycle tasks");
    }

    return taskList ?? [];
  }

  async getSettings(workspaceId: string, userId: string) {
    const membership = await this.getMembership(workspaceId, userId);
    const settings = await this.getWorkspaceSettings(workspaceId);

    return ok({
      enabled: settings.cyclesEnabled,
      lengthDays: settings.cycleLengthDays,
      startDate: settings.cyclesStartDate,
      isAdmin: membership.role === "admin",
    });
  }

  async updateSettings(
    workspaceId: string,
    userId: string,
    body: UpdateCycleSettingsDto
  ) {
    await this.requireAdmin(workspaceId, userId);
    const settings = await this.getWorkspaceSettings(workspaceId);

    const nextStartDate =
      body.startDate !== undefined
        ? this.startOfUtcDay(new Date(body.startDate))
        : (settings.cyclesStartDate ?? this.startOfUtcDay(new Date()));

    const [workspace, error] = await attempt(
      db
        .update(workspaces)
        .set({
          cyclesEnabled: body.enabled,
          cycleLengthDays: body.lengthDays,
          cyclesStartDate: body.enabled
            ? nextStartDate
            : settings.cyclesStartDate,
        })
        .where(eq(workspaces.id, workspaceId))
        .returning({
          cyclesEnabled: workspaces.cyclesEnabled,
          cycleLengthDays: workspaces.cycleLengthDays,
          cyclesStartDate: workspaces.cyclesStartDate,
        })
    );

    if (error) {
      throw new InternalServerErrorException("Failed to update cycle settings");
    }

    return ok({
      enabled: workspace?.[0]?.cyclesEnabled ?? false,
      lengthDays: workspace?.[0]?.cycleLengthDays ?? 14,
      startDate: workspace?.[0]?.cyclesStartDate ?? null,
      isAdmin: true,
    });
  }

  async getCycleByKind(workspaceId: string, userId: string, kind: CycleKind) {
    await this.getMembership(workspaceId, userId);
    const settings = await this.getWorkspaceSettings(workspaceId);

    if (!(settings.cyclesEnabled && settings.cyclesStartDate)) {
      return ok({ cycle: null, tasks: [] });
    }

    const window = this.getCycleWindow(
      settings.cyclesStartDate,
      settings.cycleLengthDays,
      kind
    );

    if (!window) {
      return ok({ cycle: null, tasks: [] });
    }

    const cycle = await this.getOrCreateCycle(
      workspaceId,
      window.index,
      window.startDate,
      window.endDate
    );

    if (!cycle) {
      throw new InternalServerErrorException("Failed to load cycle");
    }

    const cycleTasks = await this.getCycleTasks(cycle.id);
    return ok({ cycle, tasks: cycleTasks });
  }

  async updateCycle(
    workspaceId: string,
    cycleId: string,
    userId: string,
    body: UpdateCycleDto
  ) {
    await this.requireAdmin(workspaceId, userId);

    const startDate =
      body.startDate !== undefined
        ? this.startOfUtcDay(new Date(body.startDate))
        : undefined;
    const endDate =
      body.endDate !== undefined
        ? this.startOfUtcDay(new Date(body.endDate))
        : undefined;

    if (startDate && endDate && endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException("Cycle end date must be after start date");
    }

    const [cycle, error] = await attempt(
      db
        .update(cycles)
        .set({
          name: body.name,
          startDate,
          endDate,
        })
        .where(and(eq(cycles.id, cycleId), eq(cycles.workspaceId, workspaceId)))
        .returning()
    );

    if (error) {
      throw new InternalServerErrorException("Failed to update cycle");
    }

    if (!cycle?.[0]) {
      throw new NotFoundException("Cycle not found");
    }

    return ok({ cycle: cycle[0] });
  }
}

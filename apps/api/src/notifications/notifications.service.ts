import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { eq, type InferSelectModel } from "drizzle-orm";
import { db } from "@/db";
import {
  cycles,
  type NotificationType,
  notifications,
  projects,
  tasks,
} from "@/db/schema";
import { attempt } from "@/lib/error-handling";

type Task = InferSelectModel<typeof tasks>;
type Project = InferSelectModel<typeof projects>;

type NotifyParams = {
  userId?: string | null;
  workspaceId: string;
  actorId?: string | null;
  type: NotificationType;
  taskId?: string | null;
  projectId?: string | null;
  metadata?: Record<string, unknown>;
};

type TaskNotificationContext = {
  actorId?: string | null;
  projectLeadId?: string | null;
  projectName?: string | null;
};

@Injectable()
export class NotificationsService {
  private sameDayValue(left?: Date | null, right?: Date | null) {
    return (left?.toISOString() ?? null) === (right?.toISOString() ?? null);
  }

  private recipients(...userIds: Array<string | null | undefined>) {
    return [...new Set(userIds.filter((userId): userId is string => !!userId))];
  }

  private async getCycleName(cycleId?: string | null) {
    if (!cycleId) {
      return null;
    }

    const [cycle, error] = await attempt(
      db
        .select({ name: cycles.name })
        .from(cycles)
        .where(eq(cycles.id, cycleId))
        .limit(1)
    );

    if (error) {
      throw new InternalServerErrorException("Failed to get cycle name");
    }

    return cycle?.[0]?.name ?? null;
  }

  async notify(params: NotifyParams) {
    if (!(params.userId && params.userId !== params.actorId)) {
      return;
    }

    const [, error] = await attempt(
      db.insert(notifications).values({
        userId: params.userId,
        workspaceId: params.workspaceId,
        actorId: params.actorId,
        type: params.type,
        taskId: params.taskId,
        projectId: params.projectId,
        metadata: params.metadata ?? {},
      })
    );

    if (error) {
      throw new InternalServerErrorException("Failed to create notification");
    }
  }

  async notifyTaskCreated(task: Task, context: TaskNotificationContext) {
    await this.notify({
      userId: task.assigneeId,
      workspaceId: task.workspaceId,
      actorId: context.actorId,
      type: "task_assigned",
      taskId: task.id,
      projectId: task.projectId,
      metadata: {
        taskName: task.name,
        projectName: context.projectName,
      },
    });
  }

  async notifyTaskUpdate(
    before: Task,
    after: Task,
    context: TaskNotificationContext
  ) {
    const baseMetadata = {
      taskName: after.name,
      projectName: context.projectName,
    };

    if (before.assigneeId !== after.assigneeId) {
      await this.notify({
        userId: before.assigneeId,
        workspaceId: after.workspaceId,
        actorId: context.actorId,
        type: "task_unassigned",
        taskId: after.id,
        projectId: after.projectId,
        metadata: baseMetadata,
      });
      await this.notify({
        userId: after.assigneeId,
        workspaceId: after.workspaceId,
        actorId: context.actorId,
        type: "task_assigned",
        taskId: after.id,
        projectId: after.projectId,
        metadata: baseMetadata,
      });
    }

    const recipients = this.recipients(after.assigneeId, context.projectLeadId);
    const notifyRecipients = async (
      type: NotificationType,
      metadata: Record<string, unknown>
    ) => {
      await Promise.all(
        recipients.map((userId) =>
          this.notify({
            userId,
            workspaceId: after.workspaceId,
            actorId: context.actorId,
            type,
            taskId: after.id,
            projectId: after.projectId,
            metadata: {
              ...baseMetadata,
              ...metadata,
            },
          })
        )
      );
    };

    if (before.status !== after.status) {
      await notifyRecipients("task_status_changed", {
        fromStatus: before.status,
        toStatus: after.status,
      });
    }

    if (before.priority !== after.priority) {
      await notifyRecipients("task_priority_changed", {
        fromPriority: before.priority,
        toPriority: after.priority,
      });
    }

    if (!this.sameDayValue(before.dueDate, after.dueDate)) {
      await notifyRecipients("task_due_date_changed", {
        fromDueDate: before.dueDate?.toISOString() ?? null,
        toDueDate: after.dueDate?.toISOString() ?? null,
      });
    }

    if (before.cycleId !== after.cycleId) {
      if (before.cycleId) {
        await notifyRecipients("task_removed_from_cycle", {
          cycleId: before.cycleId,
          cycleName: await this.getCycleName(before.cycleId),
        });
      }

      if (after.cycleId) {
        await notifyRecipients("task_added_to_cycle", {
          cycleId: after.cycleId,
          cycleName: await this.getCycleName(after.cycleId),
        });
      }
    }
  }

  async notifyProjectLeadChange(
    beforeLeadId: Project["leadId"],
    afterLeadId: Project["leadId"],
    project: Pick<Project, "id" | "name" | "workspaceId">,
    actorId?: string | null
  ) {
    if (beforeLeadId === afterLeadId) {
      return;
    }

    await this.notify({
      userId: afterLeadId,
      workspaceId: project.workspaceId,
      actorId,
      type: "project_lead_assigned",
      projectId: project.id,
      metadata: {
        projectName: project.name,
      },
    });
  }

  private buildSnippet(content: string) {
    const plain = content.replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1");
    return plain.length > 140 ? plain.slice(0, 140) + "…" : plain;
  }

  async notifyCommentMentioned(
    recipientIds: string[],
    ctx: {
      actorId?: string | null;
      workspaceId: string;
      taskId: string;
      projectId: string;
      taskName: string;
      projectName: string;
      commentId: string;
      content: string;
    }
  ) {
    const snippet = this.buildSnippet(ctx.content);
    await Promise.all(
      recipientIds.map((userId) =>
        this.notify({
          userId,
          workspaceId: ctx.workspaceId,
          actorId: ctx.actorId,
          type: "task_comment_mention",
          taskId: ctx.taskId,
          projectId: ctx.projectId,
          metadata: {
            taskName: ctx.taskName,
            projectName: ctx.projectName,
            commentId: ctx.commentId,
            snippet,
          },
        })
      )
    );
  }

  async notifyCommentAdded(
    recipientIds: string[],
    ctx: {
      actorId?: string | null;
      workspaceId: string;
      taskId: string;
      projectId: string;
      taskName: string;
      projectName: string;
      commentId: string;
      content: string;
    }
  ) {
    const snippet = this.buildSnippet(ctx.content);
    await Promise.all(
      recipientIds.map((userId) =>
        this.notify({
          userId,
          workspaceId: ctx.workspaceId,
          actorId: ctx.actorId,
          type: "task_comment_added",
          taskId: ctx.taskId,
          projectId: ctx.projectId,
          metadata: {
            taskName: ctx.taskName,
            projectName: ctx.projectName,
            commentId: ctx.commentId,
            snippet,
          },
        })
      )
    );
  }
}

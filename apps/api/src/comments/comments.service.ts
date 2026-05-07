import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { ok } from "@/common/response";
import { db } from "@/db";
import {
  notifications,
  projects,
  taskCommentMentions,
  taskComments,
  tasks,
  users,
  workspaceMembers,
} from "@/db/schema";
import { attempt } from "@/lib/error-handling";
import { NotificationsService } from "@/notifications/notifications.service";
import type { CreateCommentDto } from "./dto/create-comment.dto";
import type { UpdateCommentDto } from "./dto/update-comment.dto";

const MENTION_REGEX = /@\[([^\]]+)\]\(([0-9a-f-]{36})\)/g;

@Injectable()
export class CommentsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  private parseMentions(content: string): string[] {
    const ids = new Set<string>();
    for (const match of content.matchAll(MENTION_REGEX)) {
      ids.add(match[2]);
    }
    return [...ids];
  }

  private async validateMembership(
    workspaceId: string,
    userIds: string[]
  ): Promise<string[]> {
    if (userIds.length === 0) return [];
    const [rows, error] = await attempt(
      db
        .select({ userId: workspaceMembers.userId })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            inArray(workspaceMembers.userId, userIds)
          )
        )
    );
    if (error) return [];
    return (rows ?? []).map((r) => r.userId);
  }

  private async getMembership(workspaceId: string, userId: string) {
    const [membership, error] = await attempt(
      db
        .select({ role: workspaceMembers.role })
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
      throw new ForbiddenException("Not a member of this workspace");
    }
    return membership[0];
  }

  async listComments(
    workspaceId: string,
    projectId: string,
    taskId: string,
    actorId: string
  ) {
    await this.getMembership(workspaceId, actorId);

    const [taskCheck, taskCheckErr] = await attempt(
      db
        .select({ id: tasks.id, projectId: tasks.projectId })
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
        .limit(1)
    );
    if (
      taskCheckErr ||
      !taskCheck?.[0] ||
      taskCheck[0].projectId !== projectId
    ) {
      throw new NotFoundException("Task not found");
    }

    const [rows, error] = await attempt(
      db
        .select({
          id: taskComments.id,
          content: taskComments.content,
          createdAt: taskComments.createdAt,
          updatedAt: taskComments.updatedAt,
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(taskComments)
        .leftJoin(users, eq(taskComments.userId, users.id))
        .where(
          and(
            eq(taskComments.taskId, taskId),
            eq(taskComments.workspaceId, workspaceId)
          )
        )
        .orderBy(asc(taskComments.createdAt))
    );

    if (error) {
      throw new InternalServerErrorException("Failed to list comments");
    }

    const commentIds = (rows ?? []).map((r) => r.id);

    let mentionRows: {
      commentId: string;
      userId: string;
      name: string;
      image: string | null;
    }[] = [];

    if (commentIds.length > 0) {
      const [mRows, mError] = await attempt(
        db
          .select({
            commentId: taskCommentMentions.commentId,
            userId: taskCommentMentions.userId,
            name: users.name,
            image: users.image,
          })
          .from(taskCommentMentions)
          .leftJoin(users, eq(taskCommentMentions.userId, users.id))
          .where(inArray(taskCommentMentions.commentId, commentIds))
      );
      if (!mError) {
        mentionRows = (mRows ?? []).map((r) => ({
          commentId: r.commentId,
          userId: r.userId,
          name: r.name ?? "",
          image: r.image ?? null,
        }));
      }
    }

    const mentionsByComment = new Map<
      string,
      { userId: string; name: string; image: string | null }[]
    >();
    for (const m of mentionRows) {
      const list = mentionsByComment.get(m.commentId) ?? [];
      list.push({ userId: m.userId, name: m.name, image: m.image });
      mentionsByComment.set(m.commentId, list);
    }

    const comments = (rows ?? []).map((r) => ({
      ...r,
      mentions: mentionsByComment.get(r.id) ?? [],
    }));

    return ok({ comments });
  }

  async createComment(
    workspaceId: string,
    projectId: string,
    taskId: string,
    actorId: string,
    dto: CreateCommentDto
  ) {
    await this.getMembership(workspaceId, actorId);

    const content = dto.content.trim();
    if (!content) {
      throw new ForbiddenException("Comment content cannot be empty");
    }

    const [taskRow, taskError] = await attempt(
      db
        .select({
          id: tasks.id,
          name: tasks.name,
          assigneeId: tasks.assigneeId,
          projectId: tasks.projectId,
        })
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
        .limit(1)
    );
    if (taskError || !taskRow?.[0]) {
      throw new NotFoundException("Task not found");
    }
    const task = taskRow[0];
    if (task.projectId !== projectId) {
      throw new NotFoundException("Task not found");
    }

    const [projectRow, projectError] = await attempt(
      db
        .select({
          id: projects.id,
          name: projects.name,
          leadId: projects.leadId,
          workspaceId: projects.workspaceId,
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    );
    if (projectError || !projectRow?.[0]) {
      throw new NotFoundException("Project not found");
    }
    const project = projectRow[0];
    if (project.workspaceId !== workspaceId) {
      throw new NotFoundException("Project not found");
    }

    const [inserted, insertError] = await attempt(
      db
        .insert(taskComments)
        .values({ taskId, workspaceId, userId: actorId, content })
        .returning({ id: taskComments.id })
    );
    if (insertError || !inserted?.[0]) {
      throw new InternalServerErrorException("Failed to create comment");
    }
    const commentId = inserted[0].id;

    const rawMentionIds = this.parseMentions(content);
    const validMentionIds = await this.validateMembership(
      workspaceId,
      rawMentionIds
    );
    const mentionedOthers = validMentionIds.filter((id) => id !== actorId);

    if (mentionedOthers.length > 0) {
      const [, mentionInsertError] = await attempt(
        db
          .insert(taskCommentMentions)
          .values(mentionedOthers.map((userId) => ({ commentId, userId })))
          .onConflictDoNothing()
      );
      if (mentionInsertError) {
        throw new InternalServerErrorException(
          "Failed to persist mention records"
        );
      }
    }

    // Watcher set: assignee + project lead + prior unique commenters
    const [priorCommenters, pcError] = await attempt(
      db
        .selectDistinct({ userId: taskComments.userId })
        .from(taskComments)
        .where(
          and(eq(taskComments.taskId, taskId), ne(taskComments.id, commentId))
        )
    );
    if (pcError) {
      throw new InternalServerErrorException("Failed to fetch watchers");
    }

    const watcherSet = new Set<string>();
    if (task.assigneeId) watcherSet.add(task.assigneeId);
    if (project.leadId) watcherSet.add(project.leadId);
    for (const row of priorCommenters ?? []) {
      if (row.userId) watcherSet.add(row.userId);
    }

    const mentionedSet = new Set(mentionedOthers);
    const watcherIds = [...watcherSet].filter(
      (id) => id !== actorId && !mentionedSet.has(id)
    );

    const notifCtx = {
      actorId,
      workspaceId,
      taskId,
      projectId,
      taskName: task.name,
      projectName: project.name,
      commentId,
      content,
    };

    await Promise.all([
      mentionedOthers.length > 0
        ? this.notificationsService.notifyCommentMentioned(
            mentionedOthers,
            notifCtx
          )
        : Promise.resolve(),
      watcherIds.length > 0
        ? this.notificationsService.notifyCommentAdded(watcherIds, notifCtx)
        : Promise.resolve(),
    ]);

    return ok({ commentId });
  }

  async updateComment(
    workspaceId: string,
    projectId: string,
    taskId: string,
    commentId: string,
    actorId: string,
    dto: UpdateCommentDto
  ) {
    const membership = await this.getMembership(workspaceId, actorId);

    const [taskCheck, taskCheckErr] = await attempt(
      db
        .select({ id: tasks.id, projectId: tasks.projectId })
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
        .limit(1)
    );
    if (
      taskCheckErr ||
      !taskCheck?.[0] ||
      taskCheck[0].projectId !== projectId
    ) {
      throw new NotFoundException("Task not found");
    }

    const [existing, fetchError] = await attempt(
      db
        .select({
          id: taskComments.id,
          userId: taskComments.userId,
          taskId: taskComments.taskId,
        })
        .from(taskComments)
        .where(
          and(
            eq(taskComments.id, commentId),
            eq(taskComments.workspaceId, workspaceId)
          )
        )
        .limit(1)
    );
    if (fetchError || !existing?.[0]) {
      throw new NotFoundException("Comment not found");
    }
    const comment = existing[0];
    if (comment.taskId !== taskId) {
      throw new NotFoundException("Comment not found");
    }

    const isAuthor = comment.userId === actorId;
    const isAdmin = membership.role === "admin";
    if (!(isAuthor || isAdmin)) {
      throw new ForbiddenException("Not allowed to edit this comment");
    }

    const content = dto.content?.trim();
    if (!content) {
      throw new ForbiddenException("Comment content cannot be empty");
    }

    const [, updateError] = await attempt(
      db
        .update(taskComments)
        .set({ content, updatedAt: new Date() })
        .where(eq(taskComments.id, commentId))
    );
    if (updateError) {
      throw new InternalServerErrorException("Failed to update comment");
    }

    // Refresh mention rows (no re-notification on edit)
    const rawMentionIds = this.parseMentions(content);
    const validMentionIds = await this.validateMembership(
      workspaceId,
      rawMentionIds
    );
    const mentionedOthers = validMentionIds.filter((id) => id !== actorId);

    const [, delError] = await attempt(
      db
        .delete(taskCommentMentions)
        .where(eq(taskCommentMentions.commentId, commentId))
    );
    if (delError) {
      throw new InternalServerErrorException("Failed to refresh mention rows");
    }

    if (mentionedOthers.length > 0) {
      await attempt(
        db
          .insert(taskCommentMentions)
          .values(mentionedOthers.map((userId) => ({ commentId, userId })))
          .onConflictDoNothing()
      );
    }

    return ok({ commentId });
  }

  async deleteComment(
    workspaceId: string,
    projectId: string,
    taskId: string,
    commentId: string,
    actorId: string
  ) {
    const membership = await this.getMembership(workspaceId, actorId);

    const [taskCheck, taskCheckErr] = await attempt(
      db
        .select({ id: tasks.id, projectId: tasks.projectId })
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
        .limit(1)
    );
    if (
      taskCheckErr ||
      !taskCheck?.[0] ||
      taskCheck[0].projectId !== projectId
    ) {
      throw new NotFoundException("Task not found");
    }

    const [existing, fetchError] = await attempt(
      db
        .select({
          id: taskComments.id,
          userId: taskComments.userId,
          taskId: taskComments.taskId,
        })
        .from(taskComments)
        .where(
          and(
            eq(taskComments.id, commentId),
            eq(taskComments.workspaceId, workspaceId)
          )
        )
        .limit(1)
    );
    if (fetchError || !existing?.[0]) {
      throw new NotFoundException("Comment not found");
    }
    if (existing[0].taskId !== taskId) {
      throw new NotFoundException("Comment not found");
    }

    const isAuthor = existing[0].userId === actorId;
    const isAdmin = membership.role === "admin";
    if (!(isAuthor || isAdmin)) {
      throw new ForbiddenException("Not allowed to delete this comment");
    }

    // Best-effort: clean up notifications referencing this comment
    await attempt(
      db
        .delete(notifications)
        .where(sql`${notifications.metadata}->>'commentId' = ${commentId}`)
    );

    const [, deleteError] = await attempt(
      db.delete(taskComments).where(eq(taskComments.id, commentId))
    );
    if (deleteError) {
      throw new InternalServerErrorException("Failed to delete comment");
    }

    return ok({ commentId });
  }
}

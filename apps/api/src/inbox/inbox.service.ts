import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { and, count, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { ok } from "@/common/response";
import { db } from "@/db";
import { notifications, projects, tasks, users } from "@/db/schema";
import { attempt } from "@/lib/error-handling";

@Injectable()
export class InboxService {
  private scope(workspaceId: string, userId: string) {
    return and(
      eq(notifications.workspaceId, workspaceId),
      eq(notifications.userId, userId)
    );
  }

  async listNotifications(workspaceId: string, userId: string) {
    const [notificationList, error] = await attempt(
      db
        .select({
          id: notifications.id,
          type: notifications.type,
          metadata: notifications.metadata,
          readAt: notifications.readAt,
          createdAt: notifications.createdAt,
          actor: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
          task: {
            id: tasks.id,
            name: tasks.name,
            projectId: tasks.projectId,
          },
          project: {
            id: projects.id,
            name: projects.name,
          },
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.actorId, users.id))
        .leftJoin(tasks, eq(notifications.taskId, tasks.id))
        .leftJoin(projects, eq(notifications.projectId, projects.id))
        .where(this.scope(workspaceId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(500)
    );

    if (error) {
      throw new InternalServerErrorException("Failed to list notifications");
    }

    return ok({ notifications: notificationList ?? [] });
  }

  async getUnreadCount(workspaceId: string, userId: string) {
    const [unreadCount, error] = await attempt(
      db
        .select({ unread: count() })
        .from(notifications)
        .where(
          and(this.scope(workspaceId, userId), isNull(notifications.readAt))
        )
    );

    if (error) {
      throw new InternalServerErrorException("Failed to get unread count");
    }

    return ok({ unread: unreadCount?.[0]?.unread ?? 0 });
  }

  async markAsRead(
    workspaceId: string,
    userId: string,
    notificationId: string
  ) {
    const [notification, error] = await attempt(
      db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            this.scope(workspaceId, userId),
            eq(notifications.id, notificationId)
          )
        )
        .returning({ id: notifications.id })
    );

    if (error) {
      throw new InternalServerErrorException(
        "Failed to mark notification read"
      );
    }

    return ok({ notificationId: notification?.[0]?.id ?? notificationId });
  }

  async markAsUnread(
    workspaceId: string,
    userId: string,
    notificationId: string
  ) {
    const [notification, error] = await attempt(
      db
        .update(notifications)
        .set({ readAt: null })
        .where(
          and(
            this.scope(workspaceId, userId),
            eq(notifications.id, notificationId)
          )
        )
        .returning({ id: notifications.id })
    );

    if (error) {
      throw new InternalServerErrorException(
        "Failed to mark notification unread"
      );
    }

    return ok({ notificationId: notification?.[0]?.id ?? notificationId });
  }

  async markAllAsRead(workspaceId: string, userId: string) {
    const [, error] = await attempt(
      db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(this.scope(workspaceId, userId), isNull(notifications.readAt))
        )
    );

    if (error) {
      throw new InternalServerErrorException(
        "Failed to mark notifications read"
      );
    }

    return ok({ success: true });
  }

  async deleteNotification(
    workspaceId: string,
    userId: string,
    notificationId: string
  ) {
    const [notification, error] = await attempt(
      db
        .delete(notifications)
        .where(
          and(
            this.scope(workspaceId, userId),
            eq(notifications.id, notificationId)
          )
        )
        .returning({ id: notifications.id })
    );

    if (error) {
      throw new InternalServerErrorException("Failed to delete notification");
    }

    return ok({ notificationId: notification?.[0]?.id ?? notificationId });
  }

  async deleteReadNotifications(workspaceId: string, userId: string) {
    const [, error] = await attempt(
      db
        .delete(notifications)
        .where(
          and(this.scope(workspaceId, userId), isNotNull(notifications.readAt))
        )
    );

    if (error) {
      throw new InternalServerErrorException(
        "Failed to delete read notifications"
      );
    }

    return ok({ success: true });
  }
}

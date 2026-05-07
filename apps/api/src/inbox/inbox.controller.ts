import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiCookieAuth } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { InboxService } from "./inbox.service";

@ApiCookieAuth()
@Controller("/workspaces/:workspaceId/inbox")
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get()
  async listNotifications(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.listNotifications(
      workspaceId,
      session.user.id
    );
  }

  @Get("count")
  async getUnreadCount(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.getUnreadCount(workspaceId, session.user.id);
  }

  @Post("mark-all-read")
  async markAllAsRead(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.markAllAsRead(workspaceId, session.user.id);
  }

  @Delete("read")
  async deleteReadNotifications(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.deleteReadNotifications(
      workspaceId,
      session.user.id
    );
  }

  @Patch(":notificationId/read")
  async markAsRead(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Param("notificationId", ParseUUIDPipe) notificationId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.markAsRead(
      workspaceId,
      session.user.id,
      notificationId
    );
  }

  @Patch(":notificationId/unread")
  async markAsUnread(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Param("notificationId", ParseUUIDPipe) notificationId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.markAsUnread(
      workspaceId,
      session.user.id,
      notificationId
    );
  }

  @Delete(":notificationId")
  async deleteNotification(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Param("notificationId", ParseUUIDPipe) notificationId: string,
    @Session() session: UserSession
  ) {
    return await this.inboxService.deleteNotification(
      workspaceId,
      session.user.id,
      notificationId
    );
  }
}

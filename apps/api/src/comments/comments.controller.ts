import {
  Body,
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
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@ApiCookieAuth()
@Controller(
  "workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments"
)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async listComments(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Session() session: UserSession
  ) {
    return await this.commentsService.listComments(
      workspaceId,
      projectId,
      taskId,
      session.user.id
    );
  }

  @Post()
  async createComment(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Session() session: UserSession,
    @Body() dto: CreateCommentDto
  ) {
    return await this.commentsService.createComment(
      workspaceId,
      projectId,
      taskId,
      session.user.id,
      dto
    );
  }

  @Patch(":commentId")
  async updateComment(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Session() session: UserSession,
    @Body() dto: UpdateCommentDto
  ) {
    return await this.commentsService.updateComment(
      workspaceId,
      projectId,
      taskId,
      commentId,
      session.user.id,
      dto
    );
  }

  @Delete(":commentId")
  async deleteComment(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Session() session: UserSession
  ) {
    return await this.commentsService.deleteComment(
      workspaceId,
      projectId,
      taskId,
      commentId,
      session.user.id
    );
  }
}

import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiCookieAuth } from "@nestjs/swagger";
import {
  OptionalAuth,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { WorkspacesService } from "./workspaces.service";

@ApiCookieAuth()
@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @OptionalAuth()
  async createWorkspace(
    @Body() body: CreateWorkspaceDto,
    @Session() session: UserSession,
    @Req() req
  ) {
    return await this.workspacesService.createWorkspace(
      body.name,
      body.slug,
      session.user.id
    );
  }
}

import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiCookieAuth } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { WorkspacesService } from "./workspaces.service";

@ApiCookieAuth()
@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async createWorkspace(
    @Body() body: CreateWorkspaceDto,
    @Session() session: UserSession
  ) {
    return await this.workspacesService.createWorkspace(
      body.name,
      body.slug,
      session.user.id
    );
  }

  @Get()
  async list(
    @Session() session: UserSession,
  ) {
    return await this.workspacesService.getWorkspaces(
      session.user.id
    );
  }
}

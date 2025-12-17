import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiCookieAuth } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { AddMemberToWorkspaceDto } from "./dto/add-member-to-workspace.dto";
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
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10
  ) {
    const offset = (page - 1) * limit;
    return await this.workspacesService.getWorkspaces(
      offset,
      limit,
      session.user.id
    );
  }

  @Get(":slug")
  async findWorkspaceBySlug(
    @Param("slug") slug: string,
    @Session() session: UserSession
  ) {
    return await this.workspacesService.findWorkspaceBySlug(
      slug,
      session.user.id
    );
  }

  @Get(":workspaceId/members")
  async getWorkspaceMembers(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
  ) {
    return await this.workspacesService.getWorkspaceMembers(workspaceId);
  }

  @Post(":workspaceId/members")
  async addMemberToWorkspace(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Body() body: AddMemberToWorkspaceDto
  ) {
    return await this.workspacesService.addMemberToWorkspace(
      workspaceId,
      body.emails,
      "developer"
    );
  }

  @Put(":slug/accessed-at")
  async updateWorkspaceAccessedAt(
    @Param("slug") slug: string,
    @Session() session: UserSession
  ) {
    return await this.workspacesService.updateWorkspaceAccessedAt(
      slug,
      session.user.id
    );
  }
}

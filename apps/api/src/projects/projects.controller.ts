import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectsService } from "./projects.service";

@Controller("/workspaces/:workspaceId/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Body() body: CreateProjectDto,
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string
  ) {
    return await this.projectsService.createProject(body, workspaceId);
  }

  @Get()
  async listProjects(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
  ) {
    return await this.projectsService.listProjects(workspaceId);
  }

  @Get(":projectId")
  async getProject(
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return await this.projectsService.getProject(projectId);
  }
}

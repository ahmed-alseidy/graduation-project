import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
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

  @Delete(":projectId")
  async deleteProject(
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return await this.projectsService.deleteProject(projectId);
  }

  @Put(":projectId")
  async updateProject(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() body: UpdateProjectDto
  ) {
    return await this.projectsService.updateProject(projectId, body);
  }
}

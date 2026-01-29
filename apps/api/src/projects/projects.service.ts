import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { ok } from "@/common/response";
import { db } from "@/db";
import { projects } from "@/db/schema/project";
import { attempt } from "@/lib/error-handling";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  async createProject(body: CreateProjectDto, workspaceId: string) {
    const [project, error] = await attempt(
      db
        .insert(projects)
        .values({
          name: body.name,
          description: body.description,
          status: body.status,
          workspaceId,
          priority: body.priority,
          startDate: body.startDate,
          endDate: body.endDate,
        })
        .returning({ id: projects.id })
    );
    if (error) {
      throw new InternalServerErrorException("Failed to create project");
    }
    return ok({ projectId: project?.[0]?.id });
  }

  async listProjects(workspaceId: string) {
    const [projectList, projectListError] = await attempt(
      db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId))
        .orderBy(desc(projects.createdAt), desc(projects.priority))
    );
    if (projectListError) {
      throw new InternalServerErrorException("Failed to list projects");
    }
    return ok({ projects: projectList ?? [] });
  }

  async getProject(projectId: string) {
    const [project, projectError] = await attempt(
      db.select().from(projects).where(eq(projects.id, projectId))
    );
    if (projectError) {
      throw new InternalServerErrorException("Failed to get project");
    }
    if (!project?.[0]) {
      throw new NotFoundException("Project not found");
    }

    return ok({ project: project?.[0] });
  }

  async deleteProject(projectId: string) {
    const [project, projectError] = await attempt(
      db.delete(projects).where(eq(projects.id, projectId))
    );
    if (projectError) {
      throw new InternalServerErrorException("Failed to delete project");
    }
    if (!project?.[0]) {
      throw new NotFoundException("Project not found");
    }

    return ok({ projectId: project?.[0]?.id });
  }

  async updateProject(projectId: string, body: UpdateProjectDto) {
    const [project, projectError] = await attempt(
      db.update(projects).set(body).where(eq(projects.id, projectId))
    );
    if (projectError) {
      throw new InternalServerErrorException("Failed to update project");
    }
    if (!project?.[0]) {
      throw new NotFoundException("Project not found");
    }

    return ok({ projectId: project?.[0]?.id });
  }
}

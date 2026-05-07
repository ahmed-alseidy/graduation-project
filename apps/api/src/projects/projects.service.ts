import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { ok } from "@/common/response";
import { db } from "@/db";
import { users } from "@/db/schema/auth-schema";
import { projects, tasks } from "@/db/schema/project";
import { attempt } from "@/lib/error-handling";
import { NotificationsService } from "@/notifications/notifications.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { CreateTaskDto, TaskStatus } from "./dto/create-task.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class ProjectsService {
  private readonly notificationsService: NotificationsService;

  constructor(notificationsService: NotificationsService) {
    this.notificationsService = notificationsService;
  }

  async createProject(
    body: CreateProjectDto,
    workspaceId: string,
    actorId?: string
  ) {
    const [project, error] = await attempt(
      db
        .insert(projects)
        .values({
          name: body.name,
          description: body.description,
          status: body.status,
          workspaceId,
          priority: body.priority,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          leadId: body.leadId,
        })
        .returning({
          id: projects.id,
          name: projects.name,
          workspaceId: projects.workspaceId,
          leadId: projects.leadId,
        })
    );
    if (error) {
      throw new InternalServerErrorException("Failed to create project");
    }

    const createdProject = project?.[0];
    if (createdProject) {
      await this.notificationsService.notifyProjectLeadChange(
        null,
        createdProject.leadId,
        createdProject,
        actorId
      );
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

    return ok({ projectId: project?.[0]?.id });
  }

  async updateProject(
    projectId: string,
    body: UpdateProjectDto,
    actorId?: string
  ) {
    const [previousProject, previousProjectError] = await attempt(
      db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
    );
    if (previousProjectError) {
      throw new InternalServerErrorException("Failed to get project");
    }
    if (!previousProject?.[0]) {
      throw new NotFoundException("Project not found");
    }

    const [project, projectError] = await attempt(
      db
        .update(projects)
        .set({
          name: body.name,
          description: body.description,
          status: body.status,
          priority: body.priority,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          leadId: body.leadId,
        })
        .where(eq(projects.id, projectId))
        .returning({
          id: projects.id,
          name: projects.name,
          workspaceId: projects.workspaceId,
          leadId: projects.leadId,
        })
    );
    if (projectError) {
      throw new InternalServerErrorException("Failed to update project");
    }
    if (!project?.[0]) {
      throw new NotFoundException("Project not found");
    }

    await this.notificationsService.notifyProjectLeadChange(
      previousProject[0].leadId,
      project[0].leadId,
      project[0],
      actorId
    );

    return ok({ projectId: project?.[0]?.id });
  }

  async createTask(
    workspaceId: string,
    projectId: string,
    body: CreateTaskDto,
    actorId?: string
  ) {
    let dueDate: Date | undefined;
    if (body.dueDate) {
      dueDate = new Date(body.dueDate);
      if (dueDate.getTime() < Date.now() - 1000 * 60 * 60 * 24) {
        throw new BadRequestException("Due date must be in the future");
      }
    }
    const [project, projectError] = await attempt(
      db.select().from(projects).where(eq(projects.id, projectId))
    );
    if (projectError) {
      throw new InternalServerErrorException("Failed to get project");
    }
    if (!project?.[0]) {
      throw new NotFoundException("Project not found");
    }

    const [task, taskError] = await attempt(
      db
        .insert(tasks)
        .values({
          ...body,
          workspaceId,
          projectId,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          cycleId: body.cycleId ?? undefined,
        })
        .returning()
    );
    if (taskError) {
      throw new InternalServerErrorException("Failed to create task");
    }

    if (task?.[0]) {
      await this.notificationsService.notifyTaskCreated(task[0], {
        actorId,
        projectLeadId: project[0].leadId,
        projectName: project[0].name,
      });
    }

    return ok({ taskId: task?.[0]?.id });
  }

  async listTasks(projectId: string) {
    const [taskList, taskListError] = await attempt(
      db
        .select({
          id: tasks.id,
          name: tasks.name,
          description: tasks.description,
          projectId: tasks.projectId,
          assigneeId: tasks.assigneeId,
          assigneeName: users.name,
          assigneeEmail: users.email,
          status: tasks.status,
          dueDate: tasks.dueDate,
          priority: tasks.priority,
          cycleId: tasks.cycleId,
          createdAt: tasks.createdAt,
        })
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .orderBy(desc(tasks.priority), desc(tasks.createdAt))
    );
    if (taskListError) {
      throw new InternalServerErrorException("Failed to list tasks");
    }

    return ok({ tasks: taskList ?? [] });
  }

  async getTask(taskId: string) {
    const [task, taskError] = await attempt(
      db.select().from(tasks).where(eq(tasks.id, taskId))
    );
    if (taskError) {
      throw new InternalServerErrorException("Failed to get task");
    }
    if (!task?.[0]) {
      throw new NotFoundException("Task not found");
    }

    return ok({ task: task?.[0] });
  }

  async updateTask(taskId: string, body: UpdateTaskDto, actorId?: string) {
    let dueDate: Date | undefined;
    if (body.dueDate) {
      dueDate = new Date(body.dueDate);
      if (dueDate.getTime() < Date.now() - 1000 * 60 * 60 * 24) {
        throw new BadRequestException("Due date must be in the future");
      }
    }

    const [previousTask, previousTaskError] = await attempt(
      db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
    );
    if (previousTaskError) {
      throw new InternalServerErrorException("Failed to get task");
    }
    if (!previousTask?.[0]) {
      throw new NotFoundException("Task not found");
    }

    const [project, projectError] = await attempt(
      db
        .select({
          leadId: projects.leadId,
          name: projects.name,
        })
        .from(projects)
        .where(eq(projects.id, previousTask[0].projectId))
        .limit(1)
    );
    if (projectError) {
      throw new InternalServerErrorException("Failed to get project");
    }

    const [task, taskError] = await attempt(
      db
        .update(tasks)
        .set({
          ...body,
          dueDate,
          status: body.status as TaskStatus,
          cycleId: body.cycleId === undefined ? undefined : body.cycleId,
        })
        .where(eq(tasks.id, taskId))
        .returning()
    );
    if (taskError) {
      throw new InternalServerErrorException("Failed to update task");
    }
    if (!task?.[0]) {
      throw new NotFoundException("Task not found");
    }

    await this.notificationsService.notifyTaskUpdate(previousTask[0], task[0], {
      actorId,
      projectLeadId: project?.[0]?.leadId,
      projectName: project?.[0]?.name,
    });

    return ok({ taskId: task?.[0]?.id });
  }

  async deleteTask(taskId: string) {
    const [task, taskError] = await attempt(
      db.delete(tasks).where(eq(tasks.id, taskId))
    );
    if (taskError) {
      throw new InternalServerErrorException("Failed to delete task");
    }

    return ok({ taskId: task?.[0]?.id });
  }
}

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, or } from "drizzle-orm";
import { ok } from "@/common/response";
import { db } from "@/db";
import { users, workspaceMembers, workspaces } from "@/db/schema";
import { attempt } from "@/lib/error-handling";

@Injectable()
export class WorkspacesService {
  async createWorkspace(
    workspaceName: string,
    workspaceSlug: string,
    ownerId: string
  ) {
    const [foundWorkspace, foundWorkspaceError] = await attempt(
      db
        .select()
        .from(workspaces)
        .where(
          or(
            eq(workspaces.name, workspaceName),
            eq(workspaces.slug, workspaceSlug)
          )
        )
        .limit(1)
    );
    if (foundWorkspaceError) {
      throw new InternalServerErrorException(
        "Failed to check if workspace exists"
      );
    }
    if (foundWorkspace?.[0]?.id) {
      throw new ConflictException("Workspace already exists");
    }

    const [workspace, error] = await attempt(
      db
        .insert(workspaces)
        .values({ name: workspaceName, slug: workspaceSlug, ownerId })
        .returning({ id: workspaces.id })
    );
    if (error) {
      throw new InternalServerErrorException("Failed to create workspace");
    }

    const [, addOwnerError] = await attempt(
      db.insert(workspaceMembers).values({
        workspaceId: workspace?.[0]?.id,
        userId: ownerId,
        role: "admin",
      })
    );
    if (addOwnerError) {
      throw new InternalServerErrorException(
        "Failed to add owner to workspace"
      );
    }

    return ok({ workspaceId: workspace?.[0]?.id });
  }

  async findWorkspaceBySlug(slug: string, userId: string) {
    const [workspace, error] = await attempt(
      db
        .select()
        .from(workspaces)
        .where(and(eq(workspaces.slug, slug), eq(workspaces.ownerId, userId)))
        .limit(1)
    );
    if (error) {
      throw new InternalServerErrorException(
        "Failed to find workspace by slug"
      );
    }
    if (!workspace?.[0]) {
      throw new NotFoundException("Workspace not found");
    }
    return ok({ workspace: workspace?.[0] });
  }

  async getWorkspaces(ownerId: string) {
    const [ownerWorkspaces, error] = await attempt(
      db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, ownerId))
        .orderBy(desc(workspaces.createdAt))
    );
    if (error) {
      throw new InternalServerErrorException("Failed to get workspaces");
    }
    return ok({ workspaces: ownerWorkspaces ?? [] });
  }

  async addMemberToWorkspace(
    workspaceId: string,
    userId: string,
    role: "admin" | "developer" | "viewer"
  ) {
    const [foundMember, foundMemberError] = await attempt(
      db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1)
    );
    if (foundMemberError) {
      throw new InternalServerErrorException(
        "Failed to check if member exists"
      );
    }
    if (foundMember) {
      throw new ConflictException("Member already exists");
    }

    const [, error] = await attempt(
      db.insert(workspaceMembers).values({ workspaceId, userId, role })
    );
    if (error) {
      throw new InternalServerErrorException(
        "Failed to add member to workspace"
      );
    }
    return ok({ success: true });
  }

  async getWorkspaceMembers(workspaceId: string) {
    const [members, error] = await attempt(
      db
        .select({
          id: workspaceMembers.id,
          name: users.name,
          email: users.email,
          image: users.image,
          role: workspaceMembers.role,
          addedAt: workspaceMembers.addedAt,
        })
        .from(workspaceMembers)
        .leftJoin(users, eq(workspaceMembers.userId, users.id))
        .where(eq(workspaceMembers.workspaceId, workspaceId))
        .orderBy(desc(workspaceMembers.addedAt))
    );
    if (error) {
      throw new InternalServerErrorException("Failed to get workspace members");
    }
    return ok({ members: members ?? [] });
  }
}

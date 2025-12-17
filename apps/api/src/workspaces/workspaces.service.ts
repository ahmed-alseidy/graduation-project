import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
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

  async getWorkspaces(offset: number, limit: number, ownerId: string) {
    const [total, totalError] = await attempt(
      db
        .select({ count: count(workspaces.id) })
        .from(workspaces)
        .where(eq(workspaces.ownerId, ownerId))
    );
    if (totalError || total?.[0]?.count === undefined) {
      throw new InternalServerErrorException("Failed to get total workspaces");
    }

    const [ownerWorkspaces, error] = await attempt(
      db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, ownerId))
        .orderBy(desc(workspaces.accessedAt))
        .offset(offset)
        .limit(limit)
    );
    if (error) {
      throw new InternalServerErrorException("Failed to get workspaces");
    }
    return ok({
      workspaces: ownerWorkspaces ?? [],
      total: total?.[0]?.count,
    });
  }

  async addMemberToWorkspace(
    workspaceId: string,
    emails: string[],
    role: "admin" | "developer" | "viewer"
  ) {
    const [foundMembers, foundMembersError] = await attempt(
      db
        .select()
        .from(workspaceMembers)
        .leftJoin(users, eq(workspaceMembers.userId, users.id))
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            inArray(users.email, emails)
          )
        )
        .limit(1)
    );
    if (foundMembersError) {
      throw new InternalServerErrorException(
        "Failed to check if member exists"
      );
    }
    if (foundMembers.length > 0) {
      throw new ConflictException("Member already exists");
    }

    const [foundUsers, foundUsersError] = await attempt(
      db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.email, emails))
    );
    if (foundUsersError) {
      throw new InternalServerErrorException("Failed to find user");
    }

    if (foundUsers.length !== emails.length) {
      throw new NotFoundException("Some users not found");
    }

    const [, addMembersError] = await attempt(
      db.insert(workspaceMembers).values(
        foundUsers.map((user) => ({
          workspaceId,
          userId: user.id,
          role,
        }))
      )
    );
    if (addMembersError) {
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

  async updateWorkspaceAccessedAt(slug: string, userId: string) {
    const [workspace, error] = await attempt(
      db
        .update(workspaces)
        .set({ accessedAt: new Date() })
        .where(and(eq(workspaces.slug, slug), eq(workspaces.ownerId, userId)))
        .returning({ id: workspaces.id })
    );
    if (error) {
      throw new InternalServerErrorException(
        "Failed to update workspace accessed at"
      );
    }
    return ok({ success: true, workspaceId: workspace?.[0]?.id ?? null });
  }
}

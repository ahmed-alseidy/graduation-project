import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { cycles } from "./cycle";
import { workspaces } from "./workspace";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["backlog", "planned", "in_progress", "completed", "cancelled"],
    })
      .notNull()
      .default("backlog"),
    priority: integer("priority").notNull().default(0),
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    leadId: text("lead_id").references(() => users.id, {
      onDelete: "set null",
    }),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    check("priority_check", sql`${t.priority} >= 0 AND ${t.priority} <= 4`),
  ]
);

export const projectRelations = relations(projects, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  lead: one(users, {
    fields: [projects.leadId],
    references: [users.id],
  }),
}));

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    assigneeId: text("assignee_id").references(() => users.id),
    cycleId: uuid("cycle_id").references(() => cycles.id, {
      onDelete: "set null",
    }),
    status: text("status", {
      enum: ["backlog", "planned", "in_progress", "completed", "cancelled"],
    })
      .notNull()
      .default("backlog"),
    dueDate: timestamp("due_date"),
    priority: integer("priority").notNull().default(0), // 0: no priority, 1: low, 2: medium, 3: high, 4: urgent
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    check("priority_check", sql`${t.priority} >= 0 AND ${t.priority} <= 4`),
  ]
);

export const taskRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  cycle: one(cycles, {
    fields: [tasks.cycleId],
    references: [cycles.id],
  }),
}));

export const taskComments = pgTable(
  "task_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id").references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [index("task_comments_task_created_idx").on(t.taskId, t.createdAt)]
);

export const taskCommentRelations = relations(
  taskComments,
  ({ one, many }) => ({
    task: one(tasks, {
      fields: [taskComments.taskId],
      references: [tasks.id],
    }),
    workspace: one(workspaces, {
      fields: [taskComments.workspaceId],
      references: [workspaces.id],
    }),
    author: one(users, {
      fields: [taskComments.userId],
      references: [users.id],
    }),
    mentions: many(taskCommentMentions),
  })
);

export const taskCommentMentions = pgTable(
  "task_comment_mentions",
  {
    commentId: uuid("comment_id")
      .references(() => taskComments.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.commentId, t.userId] })]
);

export const taskCommentMentionRelations = relations(
  taskCommentMentions,
  ({ one }) => ({
    comment: one(taskComments, {
      fields: [taskCommentMentions.commentId],
      references: [taskComments.id],
    }),
    user: one(users, {
      fields: [taskCommentMentions.userId],
      references: [users.id],
    }),
  })
);

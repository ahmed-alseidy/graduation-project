import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { projects, tasks } from "./project";
import { workspaces } from "./workspace";

export const notificationTypes = [
  "task_assigned",
  "task_unassigned",
  "task_status_changed",
  "task_priority_changed",
  "task_due_date_changed",
  "task_added_to_cycle",
  "task_removed_from_cycle",
  "project_lead_assigned",
  "task_comment_added",
  "task_comment_mention",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: text("type", { enum: notificationTypes }).notNull(),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("notifications_user_workspace_created_idx").on(
      t.userId,
      t.workspaceId,
      t.createdAt
    ),
    index("notifications_user_unread_idx").on(t.userId, t.readAt),
  ]
);

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [notifications.workspaceId],
    references: [workspaces.id],
  }),
  task: one(tasks, {
    fields: [notifications.taskId],
    references: [tasks.id],
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
}));

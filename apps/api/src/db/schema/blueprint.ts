import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./project";

export const aiBlueprints = pgTable("ai_blueprints", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  ideaDescription: text("idea_description").notNull(),
  blueprint: jsonb("blueprint").notNull(),
  status: text("status", {
    enum: ["generating", "completed", "failed"],
  })
    .notNull()
    .default("generating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiBlueprintRelations = relations(aiBlueprints, ({ one }) => ({
  project: one(projects, {
    fields: [aiBlueprints.projectId],
    references: [projects.id],
  }),
}));

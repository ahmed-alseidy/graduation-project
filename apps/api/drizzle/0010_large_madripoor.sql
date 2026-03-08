ALTER TABLE "tasks" DROP CONSTRAINT "tasks_lead_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lead_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_users_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "lead_id";
ALTER TABLE "tasks" DROP CONSTRAINT "priority_check";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "priority_check" CHECK ("tasks"."priority" >= 0 AND "tasks"."priority" <= 4);
ALTER TABLE "workspaces" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_name_unique" UNIQUE("name");
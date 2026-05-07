CREATE TABLE "task_comment_mentions" (
	"comment_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "task_comment_mentions_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "task_comments" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
UPDATE "task_comments" AS tc SET "workspace_id" = t."workspace_id" FROM "tasks" AS t WHERE t."id" = tc."task_id" AND tc."workspace_id" IS NULL;--> statement-breakpoint
ALTER TABLE "task_comments" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_comments" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "task_comment_mentions" ADD CONSTRAINT "task_comment_mentions_comment_id_task_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."task_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comment_mentions" ADD CONSTRAINT "task_comment_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_comments_task_created_idx" ON "task_comments" USING btree ("task_id","created_at");
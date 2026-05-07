-- Same semantics as notifications: naive timestamp → timestamptz using session TimeZone.
ALTER TABLE "task_comments" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING ("created_at" AT TIME ZONE current_setting('TimeZone'));--> statement-breakpoint
ALTER TABLE "task_comments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "task_comments" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING ("updated_at" AT TIME ZONE current_setting('TimeZone'));

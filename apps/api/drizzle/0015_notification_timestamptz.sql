-- Interpret naive timestamps using the migration connection's TimeZone (same semantics
-- Postgres used for implicit timestamp → timestamptz casts). Prefer running migrations
-- with TZ aligned to how the DB stored these values historically (often UTC).
ALTER TABLE "notifications" ALTER COLUMN "read_at" SET DATA TYPE timestamp with time zone USING ("read_at" AT TIME ZONE current_setting('TimeZone'));--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING ("created_at" AT TIME ZONE current_setting('TimeZone'));--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT now();

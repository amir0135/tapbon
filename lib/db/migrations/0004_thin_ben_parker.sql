ALTER TABLE "users" ADD COLUMN "reset_token_hash" char(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expires" timestamp;
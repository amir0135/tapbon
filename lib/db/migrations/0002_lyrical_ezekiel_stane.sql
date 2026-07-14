CREATE TABLE "receipt_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"receipt_id" uuid NOT NULL,
	"mime_type" varchar(30) NOT NULL,
	"byte_size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	CONSTRAINT "receipt_files_receipt_id_unique" UNIQUE("receipt_id")
);
--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "kind" varchar(10) DEFAULT 'structured' NOT NULL;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "status" varchar(10) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "confirmation_code" char(4);--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "print_job_id" varchar(100);--> statement-breakpoint
ALTER TABLE "terminals" ADD COLUMN "device_token_hash" char(64);--> statement-breakpoint
ALTER TABLE "terminals" ADD COLUMN "last_seen_at" timestamp;--> statement-breakpoint
ALTER TABLE "receipt_files" ADD CONSTRAINT "receipt_files_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_terminal_print_job_idx" ON "receipts" USING btree ("terminal_id","print_job_id");--> statement-breakpoint
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_device_token_hash_unique" UNIQUE("device_token_hash");
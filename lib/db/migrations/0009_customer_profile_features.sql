CREATE TABLE "customer_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_receipts" ADD COLUMN "project_id" integer;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "accounting_forwards" jsonb;--> statement-breakpoint
ALTER TABLE "customer_projects" ADD CONSTRAINT "customer_projects_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_receipts" ADD CONSTRAINT "customer_receipts_project_id_customer_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."customer_projects"("id") ON DELETE no action ON UPDATE no action;
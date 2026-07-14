CREATE TABLE "loyalty_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"card_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"stamps" integer DEFAULT 0 NOT NULL,
	"stamps_required" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_cards_card_token_unique" UNIQUE("card_token")
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" varchar(200) NOT NULL,
	"cvr_number" varchar(20) NOT NULL,
	"vat_number" varchar(30),
	"logo_url" text,
	"locale" varchar(5) DEFAULT 'da' NOT NULL,
	"currency" char(3) DEFAULT 'DKK' NOT NULL,
	"google_review_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipt_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"receipt_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"qty" integer NOT NULL,
	"unit_price_gross" integer NOT NULL,
	"vat_rate" integer NOT NULL,
	"line_total_gross" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" integer NOT NULL,
	"terminal_id" integer,
	"receipt_number" serial NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"currency" char(3) NOT NULL,
	"total_gross" integer NOT NULL,
	"total_net" integer NOT NULL,
	"total_vat" integer NOT NULL,
	"vat_breakdown" jsonb NOT NULL,
	"hash" char(64) NOT NULL,
	"corrects_receipt_id" uuid
);
--> statement-breakpoint
CREATE TABLE "terminals" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"public_id" varchar(12) NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "terminals_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_items" ADD CONSTRAINT "receipt_items_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_terminal_id_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
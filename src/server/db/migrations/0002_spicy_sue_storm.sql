CREATE TABLE IF NOT EXISTS "businesses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"website" varchar(255),
	"description" text,
	"business_type" varchar(100),
	"ein" varchar(100),
	"address" varchar(255),
	"phone" varchar(50),
	"business_representatives" text,
	"industry_mcc_code" varchar(50),
	"average_transaction_size" numeric(10, 2),
	"average_monthly_transaction_volume" numeric(10, 2),
	"maximum_transaction_size" numeric(10, 2),
	"accept_terms_of_service" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "type";
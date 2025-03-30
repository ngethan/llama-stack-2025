DO $$ BEGIN
 CREATE TYPE "public"."business_type" AS ENUM('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'S_CORPORATION', 'NON_PROFIT', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_representatives" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"business_id" varchar(255) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"personal_address" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"date_of_birth" timestamp (3) NOT NULL,
	"full_ssn" varchar(50) NOT NULL,
	"is_owner" boolean DEFAULT false,
	"ownership_percentage" integer,
	"is_controller" boolean DEFAULT false,
	"job_title" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN IF EXISTS "business_type";
ALTER TABLE "businesses" ADD COLUMN "business_type" business_type;--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN IF EXISTS "business_representatives";
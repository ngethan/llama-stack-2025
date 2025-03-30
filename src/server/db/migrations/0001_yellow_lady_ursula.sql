DO $$ BEGIN
 CREATE TYPE "public"."UserType" AS ENUM('USER', 'BUSINESS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "type" "UserType" DEFAULT 'BUSINESS' NOT NULL;
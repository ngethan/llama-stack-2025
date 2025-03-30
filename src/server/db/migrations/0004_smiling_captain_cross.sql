ALTER TABLE "businesses" ALTER COLUMN "legal_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "accept_terms_of_service" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "accept_terms_of_service" DROP NOT NULL;
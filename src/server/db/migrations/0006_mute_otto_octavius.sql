ALTER TABLE "business_representatives" RENAME COLUMN "business_id" TO "businessId";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "legal_name" TO "legalName";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "personal_address" TO "personalAddress";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "date_of_birth" TO "dateOfBirth";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "full_ssn" TO "fullSSN";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "is_owner" TO "isOwner";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "ownership_percentage" TO "ownershipPercentage";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "is_controller" TO "isController";--> statement-breakpoint
ALTER TABLE "business_representatives" RENAME COLUMN "job_title" TO "jobTitle";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "legal_name" TO "legalName";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "business_type" TO "businessType";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "industry_mcc_code" TO "industryMccCode";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "average_transaction_size" TO "averageTransactionSize";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "average_monthly_transaction_volume" TO "averageMonthlyTransactionVolume";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "maximum_transaction_size" TO "maximumTransactionSize";--> statement-breakpoint
ALTER TABLE "businesses" RENAME COLUMN "accept_terms_of_service" TO "acceptTermsOfService";
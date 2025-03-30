CREATE TABLE IF NOT EXISTS "medications" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"userId" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"dosage" varchar(256) NOT NULL,
	"frequency" varchar(256) NOT NULL,
	"startDate" varchar(256) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

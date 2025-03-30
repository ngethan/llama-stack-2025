CREATE TABLE IF NOT EXISTS "conversations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"lastUpdated" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memory" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"memory" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "conversationId" varchar(255) NOT NULL;
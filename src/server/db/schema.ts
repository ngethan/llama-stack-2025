import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const document_type = pgEnum("document_type", [
  "PRESCRIPTION",
  "LAB_REPORT",
  "IMAGING_REPORT",
  "VACCINATION_RECORD",
  "INSURANCE_CARD",
  "OTHER",
]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
});

export const healthcareDocuments = pgTable("healthcare_documents", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  type: document_type("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
  ocrText: text("ocrText"),
  extractedData: jsonb("extractedData"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const medicalConditions = pgTable("medical_conditions", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  diagnosisDate: timestamp("diagnosisDate", { precision: 3 }),
  severity: varchar("severity", { length: 50 }),
  status: varchar("status", { length: 50 }),
  medications: jsonb("medications"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const memory = pgTable("memory", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  memory: text("memory").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  message: text("message").notNull(),
  conversationId: varchar("conversationId", { length: 255 }).notNull(),
  isUser: boolean("isUser").notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 255 }).notNull(),
  lastUpdated: timestamp("lastUpdated", { precision: 3 })
    .notNull()
    .defaultNow(),
});

export const medications = pgTable("medications", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  dosage: varchar("dosage", { length: 256 }).notNull(),
  frequency: varchar("frequency", { length: 256 }).notNull(),
  startDate: varchar("startDate", { length: 256 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(healthcareDocuments),
  conditions: many(medicalConditions),
  messages: many(chatMessages),
}));

export const healthcareDocumentsRelations = relations(
  healthcareDocuments,
  ({ one }) => ({
    user: one(users, {
      fields: [healthcareDocuments.userId],
      references: [users.id],
    }),
  }),
);

export const medicalConditionsRelations = relations(
  medicalConditions,
  ({ one }) => ({
    user: one(users, {
      fields: [medicalConditions.userId],
      references: [users.id],
    }),
  }),
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

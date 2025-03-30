import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const business_type = pgEnum("business_type", [
  "SOLE_PROPRIETORSHIP",
  "PARTNERSHIP",
  "LLC",
  "CORPORATION",
  "S_CORPORATION",
  "NON_PROFIT",
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

export const businesses = pgTable("businesses", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  legalName: varchar("legalName", { length: 255 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  businessType: business_type("businessType"),
  ein: varchar("ein", { length: 100 }),
  address: varchar("address", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  industryMccCode: varchar("industryMccCode", { length: 50 }),
  averageTransactionSize: numeric("averageTransactionSize", {
    precision: 10,
    scale: 2,
  }),
  averageMonthlyTransactionVolume: numeric("averageMonthlyTransactionVolume", {
    precision: 10,
    scale: 2,
  }),
  maximumTransactionSize: numeric("maximumTransactionSize", {
    precision: 10,
    scale: 2,
  }),
  acceptTermsOfService: boolean("acceptTermsOfService"),
});

export const businessesRelations = relations(businesses, ({ many }) => ({
  representatives: many(businessRepresentatives),
}));

export const businessRepresentatives = pgTable("business_representatives", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  businessId: varchar("businessId", { length: 255 }).notNull(),
  legalName: varchar("legalName", { length: 255 }).notNull(),
  personalAddress: text("personalAddress").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth", {
    mode: "date",
    precision: 3,
  }).notNull(),
  fullSSN: varchar("fullSSN", { length: 50 }).notNull(),
  isOwner: boolean("isOwner").default(false),
  ownershipPercentage: integer("ownershipPercentage"),
  isController: boolean("isController").default(false),
  jobTitle: varchar("jobTitle", { length: 255 }),
});

export const businessRepresentativesRelations = relations(
  businessRepresentatives,
  ({ one }) => ({
    business: one(businesses, {
      fields: [businessRepresentatives.businessId],
      references: [businesses.id],
    }),
  }),
);

import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const goalsTable = pgTable("goals", {
  id: text("id").primaryKey(),
  deviceToken: text("device_token").notNull(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

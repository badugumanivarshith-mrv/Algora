import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const systemHealth = pgTable('system_health', {
  id: serial('id').primaryKey(),
  status: varchar('status', { length: 256 }).notNull(),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});
export type SystemHealth = typeof systemHealth.$inferSelect;
export type NewSystemHealth = typeof systemHealth.$inferInsert;

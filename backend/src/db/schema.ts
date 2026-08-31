import { pgTable, serial, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';

export const systemHealth = pgTable('system_health', {
  id: serial('id').primaryKey(),
  status: varchar('status', { length: 256 }).notNull(),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});
export type SystemHealth = typeof systemHealth.$inferSelect;
export type NewSystemHealth = typeof systemHealth.$inferInsert;

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 256 }).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: varchar('verification_token', { length: 256 }),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
  resetPasswordToken: varchar('reset_password_token', { length: 256 }),
  resetPasswordTokenExpiresAt: timestamp('reset_password_token_expires_at'),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 512 }),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

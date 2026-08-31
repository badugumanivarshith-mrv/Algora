"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.systemHealth = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.systemHealth = (0, pg_core_1.pgTable)('system_health', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    status: (0, pg_core_1.varchar)('status', { length: 256 }).notNull(),
    checkedAt: (0, pg_core_1.timestamp)('checked_at').defaultNow().notNull(),
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 30 }).notNull().unique(),
    email: (0, pg_core_1.varchar)('email', { length: 256 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 256 }).notNull(),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false).notNull(),
    verificationToken: (0, pg_core_1.varchar)('verification_token', { length: 256 }),
    verificationTokenExpiresAt: (0, pg_core_1.timestamp)('verification_token_expires_at'),
    resetPasswordToken: (0, pg_core_1.varchar)('reset_password_token', { length: 256 }),
    resetPasswordTokenExpiresAt: (0, pg_core_1.timestamp)('reset_password_token_expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});

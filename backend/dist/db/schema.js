"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemHealth = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.systemHealth = (0, pg_core_1.pgTable)('system_health', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    status: (0, pg_core_1.varchar)('status', { length: 256 }).notNull(),
    checkedAt: (0, pg_core_1.timestamp)('checked_at').defaultNow().notNull(),
});

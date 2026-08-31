"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const db_1 = require("../../db");
const drizzle_orm_1 = require("drizzle-orm");
class HealthService {
    async checkDatabase() {
        await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
    }
}
exports.HealthService = HealthService;

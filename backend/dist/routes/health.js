"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        // Perform simple query to verify database connectivity
        await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            db: 'connected',
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            db: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown database error',
        });
    }
});
exports.default = router;

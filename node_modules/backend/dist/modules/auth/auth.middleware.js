"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ error: 'Not authorized, no token provided' });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Get user from database
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId)).limit(1);
        if (!user) {
            res.status(401).json({ error: 'Not authorized, user not found' });
            return;
        }
        if (!user.emailVerified) {
            res.status(403).json({ error: 'Please verify your email address to access this feature' });
            return;
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ error: 'Not authorized, token verification failed' });
    }
};
exports.protect = protect;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const env_1 = require("../../config/env");
class AuthService {
    async hashPassword(password) {
        return bcrypt_1.default.hash(password, 10);
    }
    async comparePassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    generateRandomToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    generateJwt(userId, email) {
        const payload = { userId, email };
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: '24h' });
    }
    async findByEmail(email) {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email.toLowerCase().trim()))
            .limit(1);
        return user;
    }
    async findByUsername(username) {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username.trim()))
            .limit(1);
        return user;
    }
    async findByVerificationToken(token) {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.verificationToken, token))
            .limit(1);
        return user;
    }
    async findByResetToken(token) {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.resetPasswordToken, token))
            .limit(1);
        return user;
    }
    async createUser(data) {
        const [newUser] = await db_1.db
            .insert(schema_1.users)
            .values({
            username: data.username.trim(),
            email: data.email.toLowerCase().trim(),
            passwordHash: data.passwordHash,
            verificationToken: data.verificationToken,
            verificationTokenExpiresAt: data.verificationTokenExpiresAt,
            emailVerified: false,
        })
            .returning();
        return newUser;
    }
    async verifyUserEmail(userId) {
        await db_1.db
            .update(schema_1.users)
            .set({
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    async setVerificationToken(userId, token, expiresAt) {
        await db_1.db
            .update(schema_1.users)
            .set({
            emailVerified: false,
            verificationToken: token,
            verificationTokenExpiresAt: expiresAt,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    async setResetPasswordToken(userId, token, expiresAt) {
        await db_1.db
            .update(schema_1.users)
            .set({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: expiresAt,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    async updatePassword(userId, passwordHash) {
        await db_1.db
            .update(schema_1.users)
            .set({
            passwordHash,
            resetPasswordToken: null,
            resetPasswordTokenExpiresAt: null,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    async updateProfile(userId, data) {
        const updateData = {
            updatedAt: new Date(),
        };
        if (data.username !== undefined)
            updateData.username = data.username.trim();
        if (data.email !== undefined)
            updateData.email = data.email.toLowerCase().trim();
        if (data.emailVerified !== undefined)
            updateData.emailVerified = data.emailVerified;
        if (data.verificationToken !== undefined)
            updateData.verificationToken = data.verificationToken;
        if (data.verificationTokenExpiresAt !== undefined) {
            updateData.verificationTokenExpiresAt = data.verificationTokenExpiresAt;
        }
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .returning();
        return updatedUser;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../db';
import { users, User, NewUser } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { env } from '../../config/env';
import { JwtPayload } from './auth.types';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateJwt(userId: number, email: string): string {
    const payload: JwtPayload = { userId, email };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim()))
      .limit(1);
    return user;
  }

  async findByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);
    return user;
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1);
    return user;
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    verificationToken: string;
    verificationTokenExpiresAt: Date;
  }): Promise<User> {
    const [newUser] = await db
      .insert(users)
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

  async verifyUserEmail(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async setVerificationToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerified: false,
        verificationToken: token,
        verificationTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async setResetPasswordToken(
    userId: number,
    token: string | null,
    expiresAt: Date | null
  ): Promise<void> {
    await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateProfile(
    userId: number,
    data: {
      username?: string;
      email?: string;
      emailVerified?: boolean;
      verificationToken?: string | null;
      verificationTokenExpiresAt?: Date | null;
    }
  ): Promise<User> {
    const updateData: Partial<NewUser> = {
      updatedAt: new Date(),
    };

    if (data.username !== undefined) updateData.username = data.username.trim();
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
    if (data.verificationToken !== undefined) updateData.verificationToken = data.verificationToken;
    if (data.verificationTokenExpiresAt !== undefined) {
      updateData.verificationTokenExpiresAt = data.verificationTokenExpiresAt;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
export const authService = new AuthService();

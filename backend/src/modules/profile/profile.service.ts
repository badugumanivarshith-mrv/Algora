import { db } from '../../db';
import { users, User } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class ProfileService {
  async getProfile(userId: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user;
  }

  async updateProfile(
    userId: number,
    data: {
      username?: string;
      displayName?: string | null;
      bio?: string | null;
      email?: string;
      emailVerified?: boolean;
      verificationToken?: string | null;
      verificationTokenExpiresAt?: Date | null;
    }
  ): Promise<User> {
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.username !== undefined) updateData.username = data.username.trim();
    if (data.displayName !== undefined) updateData.displayName = data.displayName?.trim() || null;
    if (data.bio !== undefined) updateData.bio = data.bio;
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

  async updateAvatar(userId: number, avatarUrl: string | null): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
}

export const profileService = new ProfileService();

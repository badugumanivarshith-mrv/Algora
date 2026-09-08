import { db } from '../../db';
import { userStreaks, userXp, userActivity } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class ProgressService {
  /**
   * Alias for handleStreak / handleLoginStreak
   */
  static async updateStreak(userId: number) {
    return this.handleLoginStreak(userId);
  }

  /**
   * Updates user streak based on activity date.
   * - Same calendar day: no change to current streak
   * - Consecutive day (1 day diff): increment streak by 1
   * - Missed day(s) (>1 day diff): reset streak to 1
   */
  static async handleLoginStreak(userId: number) {
    const [streakRecord] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    const now = new Date();

    if (!streakRecord) {
      await db.insert(userStreaks).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: now,
      });
      return { streak: 1, type: 'new_streak' };
    }

    const lastActive = streakRecord.lastActiveDate;
    let newStreak = streakRecord.currentStreak;
    let longestStreak = streakRecord.longestStreak;

    if (lastActive) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const daysSinceLastActive = Math.floor((today.getTime() - lastActiveDate.getTime()) / msPerDay);

      if (daysSinceLastActive === 1) {
        // Increment streak
        newStreak += 1;
        if (newStreak > longestStreak) longestStreak = newStreak;
      } else if (daysSinceLastActive > 1) {
        // Reset streak
        newStreak = 1;
      }
    } else {
      newStreak = 1;
      longestStreak = Math.max(1, longestStreak);
    }

    await db.update(userStreaks).set({
      currentStreak: newStreak,
      longestStreak: longestStreak,
      lastActiveDate: now,
      updatedAt: now,
    }).where(eq(userStreaks.userId, userId));

    return { streak: newStreak, type: 'updated_streak' };
  }

  /**
   * Adds XP to a user and calculates leveling up.
   * Formula: level = floor(sqrt(xp / 100)) + 1
   */
  static async addXp(userId: number, xpToAdd: number) {
    if (xpToAdd <= 0) return { xp: 0, level: 1 };

    const [xpRecord] = await db.select().from(userXp).where(eq(userXp.userId, userId));

    let currentXp = xpToAdd;
    if (xpRecord) {
      currentXp += xpRecord.totalXp;
    }

    const newLevel = Math.floor(Math.sqrt(currentXp / 100)) + 1;

    if (!xpRecord) {
      await db.insert(userXp).values({
        userId,
        totalXp: currentXp,
        level: newLevel,
      });
    } else {
      await db.update(userXp).set({
        totalXp: currentXp,
        level: newLevel,
        updatedAt: new Date(),
      }).where(eq(userXp.userId, userId));
    }

    return { xp: currentXp, level: newLevel };
  }

  static getRankTitle(level: number): string {
    if (level >= 10) return 'Grandmaster';
    if (level >= 7) return 'Master';
    if (level >= 5) return 'Expert';
    if (level >= 3) return 'Coder';
    if (level >= 2) return 'Apprentice';
    return 'Novice';
  }

  static async getProgress(userId: number) {
    const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    const [xp] = await db.select().from(userXp).where(eq(userXp.userId, userId));

    const totalXp = xp?.totalXp || 0;
    const level = xp?.level || 1;
    const rank = this.getRankTitle(level);

    return {
      streak: streak || { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
      xp: {
        totalXp,
        level,
        rank,
      }
    };
  }

  static async logActivity(userId: number, action: string, metadata: any = {}, problemId?: number) {
    await db.insert(userActivity).values({
      userId,
      problemId,
      action,
      metadata,
    });
  }
}

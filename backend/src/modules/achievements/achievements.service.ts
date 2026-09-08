import { db } from '../../db';
import { achievements, userAchievements, userStreaks, solvedProblems, problems } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { ProgressService } from '../progress/progress.service';

export class AchievementsService {
  /**
   * Checks and unlocks achievements based on the user's current state.
   */
  static async checkAchievements(userId: number) {
    // 1. Get all achievements not yet unlocked by the user
    const allAchievements = await db.select().from(achievements);
    const unlocked = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    const unlockedIds = new Set(unlocked.map(a => a.achievementId));

    const pendingAchievements = allAchievements.filter(a => !unlockedIds.has(a.id));
    if (pendingAchievements.length === 0) return [];

    // 2. Gather user stats
    // Solved problems count and breakdown by difficulty
    const userSolved = await db
      .select({
        problemId: solvedProblems.problemId,
        difficulty: problems.difficulty,
      })
      .from(solvedProblems)
      .innerJoin(problems, eq(problems.id, solvedProblems.problemId))
      .where(eq(solvedProblems.userId, userId));

    const problemsSolved = userSolved.length;
    const easySolved = userSolved.filter(s => s.difficulty === 'Easy').length;
    const mediumSolved = userSolved.filter(s => s.difficulty === 'Medium').length;
    const hardSolved = userSolved.filter(s => s.difficulty === 'Hard').length;

    // Streak
    const [streakData] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    const currentStreak = streakData?.currentStreak || 0;
    const longestStreak = streakData?.longestStreak || 0;
    const maxStreak = Math.max(currentStreak, longestStreak);

    const newlyUnlocked = [];

    // 3. Evaluate each pending achievement
    for (const ach of pendingAchievements) {
      let isUnlocked = false;

      const lowerName = ach.name.toLowerCase();

      if (ach.category === 'Consistency') {
        if (lowerName.includes('3 day') && maxStreak >= 3) isUnlocked = true;
        if (lowerName.includes('7 day') && maxStreak >= 7) isUnlocked = true;
        if (lowerName.includes('30 day') && maxStreak >= 30) isUnlocked = true;
      } else if (ach.category === 'Solver' || ach.category === 'Starter') {
        if ((lowerName.includes('first') || lowerName.includes('starter')) && problemsSolved >= 1) isUnlocked = true;
        if (lowerName.includes('10') && problemsSolved >= 10) isUnlocked = true;
        if (lowerName.includes('50') && problemsSolved >= 50) isUnlocked = true;
        if (lowerName.includes('100') && problemsSolved >= 100) isUnlocked = true;
      } else if (ach.category === 'Difficulty') {
        if (lowerName.includes('easy') && easySolved >= 5) isUnlocked = true;
        if (lowerName.includes('medium') && mediumSolved >= 5) isUnlocked = true;
        if (lowerName.includes('hard') && hardSolved >= 3) isUnlocked = true;
      }

      if (isUnlocked) {
        // Double check idempotency before insertion
        const [alreadyHas] = await db
          .select()
          .from(userAchievements)
          .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, ach.id)));

        if (!alreadyHas) {
          await db.insert(userAchievements).values({
            userId,
            achievementId: ach.id,
          });

          // Grant XP reward
          if (ach.xpReward > 0) {
            await ProgressService.addXp(userId, ach.xpReward);
          }

          // Log activity
          await ProgressService.logActivity(userId, 'achievement_unlocked', { achievementId: ach.id, name: ach.name });

          newlyUnlocked.push(ach);
        }
      }
    }

    return newlyUnlocked;
  }

  static async getUserAchievements(userId: number) {
    const unlocked = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        xpReward: achievements.xpReward,
        unlockedAt: userAchievements.unlockedAt
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return unlocked;
  }

  static async getAllAchievements() {
    return db.select().from(achievements);
  }
}

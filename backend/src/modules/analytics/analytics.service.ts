import { db } from '../../db';
import { users, userActivity, solvedProblems, problems, problemTags, tags, userXp, userStreaks, submissions, achievements, userAchievements } from '../../db/schema';
import { eq, desc, gte, and, sql, ilike, or } from 'drizzle-orm';
import { ProgressService } from '../progress/progress.service';

export interface LeaderboardItem {
  rank: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  rankTitle: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalSubmissions: number;
  accuracyRate: number;
}

export class AnalyticsService {
  /**
   * Get user profile analytics: XP, streak, solve breakdown, accuracy, and tags
   */
  static async getUserProfileAnalytics(userId: number) {
    // 1. XP & Streak
    const progress = await ProgressService.getProgress(userId);

    // 2. Solved problems breakdown
    const userSolved = await db
      .select({
        problemId: solvedProblems.problemId,
        difficulty: problems.difficulty,
      })
      .from(solvedProblems)
      .innerJoin(problems, eq(problems.id, solvedProblems.problemId))
      .where(eq(solvedProblems.userId, userId));

    const easySolved = userSolved.filter((s) => s.difficulty === 'Easy').length;
    const mediumSolved = userSolved.filter((s) => s.difficulty === 'Medium').length;
    const hardSolved = userSolved.filter((s) => s.difficulty === 'Hard').length;
    const totalSolved = userSolved.length;

    // Total available problems
    const allProblems = await db.select({ id: problems.id, difficulty: problems.difficulty }).from(problems);
    const totalEasy = allProblems.filter((p) => p.difficulty === 'Easy').length;
    const totalMedium = allProblems.filter((p) => p.difficulty === 'Medium').length;
    const totalHard = allProblems.filter((p) => p.difficulty === 'Hard').length;
    const totalProblems = allProblems.length;

    // Submissions and accuracy
    const userSubs = await db
      .select({ status: submissions.status })
      .from(submissions)
      .where(eq(submissions.userId, userId));

    const totalSubmissions = userSubs.length;
    const acceptedSubmissions = userSubs.filter((s) => s.status === 'Accepted').length;
    const accuracyRate = totalSubmissions > 0 ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;

    // Tags distribution
    const tagsDistribution = await this.getSolvedTagsDistribution(userId);

    return {
      xp: progress.xp.totalXp,
      level: progress.xp.level,
      rank: progress.xp.rank,
      streak: progress.streak,
      solved: {
        easy: easySolved,
        totalEasy,
        medium: mediumSolved,
        totalMedium,
        hard: hardSolved,
        totalHard,
        total: totalSolved,
        totalProblems,
      },
      stats: {
        totalSubmissions,
        acceptedSubmissions,
        accuracyRate,
      },
      tagsDistribution,
    };
  }

  /**
   * Get paginated leaderboard
   */
  static async getLeaderboard(options: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const offset = (page - 1) * limit;

    const allUsers = await db.select().from(users);
    const allXp = await db.select().from(userXp);
    const allSolved = await db
      .select({
        userId: solvedProblems.userId,
        difficulty: problems.difficulty,
      })
      .from(solvedProblems)
      .innerJoin(problems, eq(problems.id, solvedProblems.problemId));

    const allSubmissions = await db
      .select({
        userId: submissions.userId,
        status: submissions.status,
      })
      .from(submissions);

    let rankings: Omit<LeaderboardItem, 'rank'>[] = allUsers.map((u) => {
      const uXp = allXp.find((x) => x.userId === u.id);
      const totalXp = uXp?.totalXp || 0;
      const level = uXp?.level || 1;
      const rankTitle = ProgressService.getRankTitle(level);

      const userSolved = allSolved.filter((s) => s.userId === u.id);
      const easySolved = userSolved.filter((s) => s.difficulty === 'Easy').length;
      const mediumSolved = userSolved.filter((s) => s.difficulty === 'Medium').length;
      const hardSolved = userSolved.filter((s) => s.difficulty === 'Hard').length;
      const totalSolved = userSolved.length;

      const userSubs = allSubmissions.filter((sub) => sub.userId === u.id);
      const totalSubmissions = userSubs.length;
      const acceptedSubs = userSubs.filter((sub) => sub.status === 'Accepted').length;
      const accuracyRate = totalSubmissions > 0 ? parseFloat(((acceptedSubs / totalSubmissions) * 100).toFixed(1)) : 0;

      return {
        userId: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        xp: totalXp,
        level,
        rankTitle,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        totalSubmissions,
        accuracyRate,
      };
    });

    // Sort by XP desc, totalSolved desc, accuracyRate desc, username asc
    rankings.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.totalSolved !== a.totalSolved) return b.totalSolved - a.totalSolved;
      if (b.accuracyRate !== a.accuracyRate) return b.accuracyRate - a.accuracyRate;
      return a.username.localeCompare(b.username);
    });

    const fullRanked = rankings.map((item, idx) => ({ ...item, rank: idx + 1 }));

    // Filter search if provided
    let filtered = fullRanked;
    if (options.search && options.search.trim() !== '') {
      const q = options.search.trim().toLowerCase();
      filtered = fullRanked.filter(
        (r) => r.username.toLowerCase().includes(q) || (r.displayName && r.displayName.toLowerCase().includes(q))
      );
    }

    const totalItems = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      rankings: paginated,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    };
  }

  /**
   * Get recent activity for a user
   */
  static async getRecentActivity(userId: number, limit: number = 20) {
    const activity = await db.select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.createdAt))
      .limit(limit);

    return activity;
  }

  /**
   * Get all achievements with user unlock status
   */
  static async getAchievementsWithUserStatus(userId: number) {
    const all = await db.select().from(achievements);
    const userUnlocked = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    const unlockedMap = new Map<number, string>();
    userUnlocked.forEach((ua) => unlockedMap.set(ua.achievementId, ua.unlockedAt.toISOString()));

    return all.map((ach) => ({
      ...ach,
      unlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }));
  }

  /**
   * Get tag distribution of solved problems
   */
  static async getSolvedTagsDistribution(userId: number) {
    const distribution = await db
      .select({
        tagName: tags.name,
        count: sql<number>`cast(count(${solvedProblems.problemId}) as int)`
      })
      .from(solvedProblems)
      .innerJoin(problems, eq(solvedProblems.problemId, problems.id))
      .innerJoin(problemTags, eq(problems.id, problemTags.problemId))
      .innerJoin(tags, eq(problemTags.tagId, tags.id))
      .where(eq(solvedProblems.userId, userId))
      .groupBy(tags.name)
      .orderBy(desc(sql`count(${solvedProblems.problemId})`));

    return distribution;
  }
}

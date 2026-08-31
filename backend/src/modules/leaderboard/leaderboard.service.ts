import { db } from '../../db';
import { users, solvedProblems, problems, submissions } from '../../db/schema';
import { eq } from 'drizzle-orm';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

export class LeaderboardService {
  async getGlobalRankings(): Promise<LeaderboardEntry[]> {
    const allUsers = await db.select().from(users);
    const allSolved = await db
      .select({
        userId: solvedProblems.userId,
        problemId: solvedProblems.problemId,
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

    const rankings: Omit<LeaderboardEntry, 'rank'>[] = allUsers.map((u) => {
      const userSolved = allSolved.filter((s) => s.userId === u.id);
      const easySolved = userSolved.filter((s) => s.difficulty === 'Easy').length;
      const mediumSolved = userSolved.filter((s) => s.difficulty === 'Medium').length;
      const hardSolved = userSolved.filter((s) => s.difficulty === 'Hard').length;
      const totalSolved = userSolved.length;

      const userSubs = allSubmissions.filter((sub) => sub.userId === u.id);
      const totalSubmissions = userSubs.length;
      const acceptedSubs = userSubs.filter((sub) => sub.status === 'Accepted').length;
      const acceptanceRate = totalSubmissions > 0 ? parseFloat(((acceptedSubs / totalSubmissions) * 100).toFixed(1)) : 0;

      return {
        userId: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        totalSubmissions,
        acceptanceRate,
      };
    });

    // Sort by totalSolved desc, acceptanceRate desc, username asc
    rankings.sort((a, b) => {
      if (b.totalSolved !== a.totalSolved) {
        return b.totalSolved - a.totalSolved;
      }
      if (b.acceptanceRate !== a.acceptanceRate) {
        return b.acceptanceRate - a.acceptanceRate;
      }
      return a.username.localeCompare(b.username);
    });

    return rankings.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getUserProgress(userId: number) {
    const userSolved = await db
      .select({
        problemId: solvedProblems.problemId,
        difficulty: problems.difficulty,
      })
      .from(solvedProblems)
      .innerJoin(problems, eq(problems.id, solvedProblems.problemId))
      .where(eq(solvedProblems.userId, userId));

    const allProblems = await db.select({ id: problems.id, difficulty: problems.difficulty }).from(problems);
    const totalEasy = allProblems.filter((p) => p.difficulty === 'Easy').length;
    const totalMedium = allProblems.filter((p) => p.difficulty === 'Medium').length;
    const totalHard = allProblems.filter((p) => p.difficulty === 'Hard').length;

    const easySolved = userSolved.filter((s) => s.difficulty === 'Easy').length;
    const mediumSolved = userSolved.filter((s) => s.difficulty === 'Medium').length;
    const hardSolved = userSolved.filter((s) => s.difficulty === 'Hard').length;

    const userSubs = await db
      .select({ status: submissions.status })
      .from(submissions)
      .where(eq(submissions.userId, userId));

    const totalSubmissions = userSubs.length;
    const acceptedSubs = userSubs.filter((s) => s.status === 'Accepted').length;
    const acceptanceRate = totalSubmissions > 0 ? parseFloat(((acceptedSubs / totalSubmissions) * 100).toFixed(1)) : 0;

    return {
      easySolved,
      totalEasy,
      mediumSolved,
      totalMedium,
      hardSolved,
      totalHard,
      totalSolved: userSolved.length,
      totalSubmissions,
      acceptanceRate,
    };
  }
}

export const leaderboardService = new LeaderboardService();

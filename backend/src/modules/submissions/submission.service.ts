import { db } from '../../db';
import { submissions, problems, testCases } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateSubmissionInput, SubmissionWithProblem } from './submission.types';
import { judgeService } from '../judge/judge.service';

export class SubmissionService {
  async submitSolution(userId: number, input: CreateSubmissionInput) {
    const problem = await db.select().from(problems).where(eq(problems.id, input.problemId)).limit(1).then((r) => r[0]);
    if (!problem) throw new Error('Problem not found');

    const allTestCases = await db.select().from(testCases).where(eq(testCases.problemId, problem.id));
    if (allTestCases.length === 0) {
      throw new Error('No test cases found for this problem');
    }

    // 1. Create submission record in 'Pending' state
    const [sub] = await db
      .insert(submissions)
      .values({
        userId,
        problemId: problem.id,
        language: input.language,
        sourceCode: input.sourceCode,
        status: 'Pending',
        runtime: 0,
        memory: 0,
      })
      .returning();

    // 2. Enqueue job for asynchronous judge worker processing
    const job = await judgeService.enqueueJob(sub.id);

    return {
      submission: sub,
      jobId: job.id,
    };
  }

  async getMySubmissions(userId: number): Promise<SubmissionWithProblem[]> {
    const list = await db
      .select({
        submission: submissions,
        problem: {
          title: problems.title,
          slug: problems.slug,
        },
      })
      .from(submissions)
      .innerJoin(problems, eq(problems.id, submissions.problemId))
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.submittedAt));

    return list.map((item) => ({
      ...item.submission,
      problem: item.problem,
    }));
  }

  async getSubmissionById(id: number, userId: number) {
    const [sub] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    if (!sub) return undefined;

    if (sub.userId !== userId) {
      throw new Error('Not authorized to access this submission');
    }

    const problem = await db.select().from(problems).where(eq(problems.id, sub.problemId)).limit(1).then((r) => r[0]);
    const results = await judgeService.getSubmissionResults(sub.id);

    return {
      ...sub,
      problemTitle: problem?.title || 'Unknown Problem',
      problemSlug: problem?.slug || '',
      results,
    };
  }
}

export const submissionService = new SubmissionService();

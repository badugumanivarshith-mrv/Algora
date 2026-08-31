import { db } from '../db';
import { executionJobs, submissions, problems, testCases, submissionResults, solvedProblems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { executionEngine, TestCaseExecutionResult } from '../modules/judge/execution.engine';
import { verdictEngine } from '../modules/judge/verdict.engine';

export class WorkerProcessor {
  private isProcessing = false;

  async processNextJob(): Promise<boolean> {
    if (this.isProcessing) return false;
    this.isProcessing = true;

    try {
      // 1. Fetch next queued job
      const [job] = await db
        .select()
        .from(executionJobs)
        .where(eq(executionJobs.status, 'queued'))
        .limit(1);

      if (!job) {
        this.isProcessing = false;
        return false;
      }

      // 2. Mark job as processing
      await db
        .update(executionJobs)
        .set({
          status: 'processing',
          startedAt: new Date(),
        })
        .where(eq(executionJobs.id, job.id));

      // 3. Fetch submission details
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, job.submissionId))
        .limit(1);

      if (!submission) {
        await db
          .update(executionJobs)
          .set({ status: 'failed', completedAt: new Date() })
          .where(eq(executionJobs.id, job.id));
        this.isProcessing = false;
        return true;
      }

      // 4. Fetch problem and test cases
      const [problem] = await db
        .select()
        .from(problems)
        .where(eq(problems.id, submission.problemId))
        .limit(1);

      const allTestCases = await db
        .select()
        .from(testCases)
        .where(eq(testCases.problemId, submission.problemId));

      if (!problem || allTestCases.length === 0) {
        await db
          .update(submissions)
          .set({ status: 'Compilation Error' })
          .where(eq(submissions.id, submission.id));

        await db
          .update(executionJobs)
          .set({ status: 'completed', completedAt: new Date() })
          .where(eq(executionJobs.id, job.id));

        this.isProcessing = false;
        return true;
      }

      // 5. Execute code against test cases
      const caseResults: TestCaseExecutionResult[] = [];

      for (const tc of allTestCases) {
        const res = await executionEngine.executeTestCase({
          sourceCode: submission.sourceCode,
          language: submission.language,
          problemSlug: problem.slug,
          testCaseInput: tc.input,
          expectedOutput: tc.expectedOutput,
        });

        caseResults.push(res);

        // Store individual test case result
        await db.insert(submissionResults).values({
          submissionId: submission.id,
          testCaseId: tc.id,
          status: res.status,
          runtime: res.runtime,
          memory: res.memory,
          errorMessage: res.errorMessage || null,
        });

        // Break early if fatal compile error
        if (res.status === 'Compilation Error') {
          break;
        }
      }

      // 6. Compute aggregate verdict
      const overall = verdictEngine.computeOverallVerdict(caseResults);

      // 7. Update submission record
      await db
        .update(submissions)
        .set({
          status: overall.status,
          runtime: overall.totalRuntime,
          memory: overall.maxMemory,
        })
        .where(eq(submissions.id, submission.id));

      // 8. Update problem acceptance statistics
      const totalSubs = problem.totalSubmissions + 1;
      const successfulSubs = problem.successfulSubmissions + (overall.status === 'Accepted' ? 1 : 0);
      const newAcceptanceRate = parseFloat(((successfulSubs / totalSubs) * 100).toFixed(1));

      await db
        .update(problems)
        .set({
          totalSubmissions: totalSubs,
          successfulSubmissions: successfulSubs,
          acceptanceRate: newAcceptanceRate,
        })
        .where(eq(problems.id, problem.id));

      // 9. Track solved problem for user if Accepted
      if (overall.status === 'Accepted') {
        const [alreadySolved] = await db
          .select()
          .from(solvedProblems)
          .where(
            and(
              eq(solvedProblems.userId, submission.userId),
              eq(solvedProblems.problemId, problem.id)
            )
          )
          .limit(1);

        if (!alreadySolved) {
          await db.insert(solvedProblems).values({
            userId: submission.userId,
            problemId: problem.id,
          });
        }
      }

      // 10. Mark job as completed
      await db
        .update(executionJobs)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(executionJobs.id, job.id));

      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error('Error processing execution job:', err);
      this.isProcessing = false;
      return false;
    }
  }

  startWorkerLoop(intervalMs = 300) {
    setInterval(async () => {
      await this.processNextJob();
    }, intervalMs);
  }
}

export const workerProcessor = new WorkerProcessor();

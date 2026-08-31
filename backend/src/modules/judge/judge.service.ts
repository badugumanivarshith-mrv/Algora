import { db } from '../../db';
import { executionJobs, submissionResults, testCases } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { workerProcessor } from '../../workers/worker.processor';

export class JudgeService {
  async enqueueJob(submissionId: number) {
    const [job] = await db
      .insert(executionJobs)
      .values({
        submissionId,
        status: 'queued',
      })
      .returning();

    // Trigger worker processing asynchronously
    setTimeout(() => {
      workerProcessor.processNextJob().catch(console.error);
    }, 10);

    return job;
  }

  async getJobs() {
    return db.select().from(executionJobs).orderBy(desc(executionJobs.createdAt));
  }

  async getJobById(id: number) {
    const [job] = await db.select().from(executionJobs).where(eq(executionJobs.id, id)).limit(1);
    return job;
  }

  async getSubmissionResults(submissionId: number) {
    const results = await db
      .select({
        id: submissionResults.id,
        submissionId: submissionResults.submissionId,
        testCaseId: submissionResults.testCaseId,
        status: submissionResults.status,
        runtime: submissionResults.runtime,
        memory: submissionResults.memory,
        errorMessage: submissionResults.errorMessage,
        createdAt: submissionResults.createdAt,
        isHidden: testCases.isHidden,
        input: testCases.input,
        expectedOutput: testCases.expectedOutput,
      })
      .from(submissionResults)
      .innerJoin(testCases, eq(testCases.id, submissionResults.testCaseId))
      .where(eq(submissionResults.submissionId, submissionId));

    // Redact hidden test cases input/output for security
    return results.map((r) => ({
      id: r.id,
      testCaseId: r.testCaseId,
      status: r.status,
      runtime: r.runtime,
      memory: r.memory,
      errorMessage: r.errorMessage,
      createdAt: r.createdAt,
      isHidden: r.isHidden,
      input: r.isHidden ? '[Hidden Test Case]' : r.input,
      expectedOutput: r.isHidden ? '[Hidden Test Case]' : r.expectedOutput,
    }));
  }
}

export const judgeService = new JudgeService();

import vm from 'vm';
import { db } from '../../db';
import { submissions, problems, testCases } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateSubmissionInput, SubmissionWithProblem } from './submission.types';

export class SubmissionService {
  // Map problem slug to entrypoint function name
  private getEntrypointName(slug: string): string {
    const mapping: Record<string, string> = {
      'two-sum': 'twoSum',
      'valid-parentheses': 'isValid',
      'palindrome-number': 'isPalindrome',
      'add-two-numbers': 'addTwoNumbers',
      'longest-substring-without-repeating-characters': 'lengthOfLongestSubstring',
      'median-of-two-sorted-arrays': 'findMedianSortedArrays',
    };
    return mapping[slug] || 'solve';
  }

  async submitSolution(userId: number, input: CreateSubmissionInput) {
    const problem = await db.select().from(problems).where(eq(problems.id, input.problemId)).limit(1).then(r => r[0]);
    if (!problem) throw new Error('Problem not found');

    const allTestCases = await db.select().from(testCases).where(eq(testCases.problemId, problem.id));
    if (allTestCases.length === 0) {
      throw new Error('No test cases found for this problem');
    }

    let finalStatus: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded' = 'Accepted';
    let failedTestCaseIndex = -1;
    let actualOutput = '';
    let errorMessage = '';
    
    const startTime = Date.now();
    let runtime = 0;
    let memory = 0; // Mock memory in KB

    if (input.language.toLowerCase() === 'javascript') {
      const entrypoint = this.getEntrypointName(problem.slug);

      try {
        // First compile/validate the script syntax
        new vm.Script(input.sourceCode);

        // Run against test cases
        for (let i = 0; i < allTestCases.length; i++) {
          const tc = allTestCases[i];
          
          // Parse inputs: each line is an argument
          const args = tc.input.trim().split('\n').map((line) => {
            try {
              return JSON.parse(line);
            } catch {
              return line;
            }
          });

          const sandbox = {
            console: { log: () => {} }
          };
          
          // Script to execute the user code and evaluate the entrypoint
          const runScriptText = `
            ${input.sourceCode}
            ;const __res = ${entrypoint}(...${JSON.stringify(args)});
            __res;
          `;

          try {
            const context = vm.createContext(sandbox);
            const script = new vm.Script(runScriptText);
            
            // Execute with 1 second timeout
            const actualVal = script.runInContext(context, { timeout: 1000 });
            
            // Normalize outputs
            const actualStr = actualVal !== undefined ? JSON.stringify(actualVal) : 'undefined';
            
            // Parse expected output to handle spacing
            let expectedParsed;
            try {
              expectedParsed = JSON.parse(tc.expectedOutput);
            } catch {
              expectedParsed = tc.expectedOutput.trim();
            }

            const expectedStr = JSON.stringify(expectedParsed);

            if (actualStr !== expectedStr && String(actualVal).trim() !== tc.expectedOutput.trim()) {
              finalStatus = 'Wrong Answer';
              failedTestCaseIndex = i;
              actualOutput = actualStr;
              break;
            }
          } catch (runError: unknown) {
            const err = runError as Error;
            if (err.message && err.message.includes('Timeout')) {
              finalStatus = 'Time Limit Exceeded';
            } else {
              finalStatus = 'Runtime Error';
              errorMessage = err.message || 'Runtime Error';
            }
            failedTestCaseIndex = i;
            break;
          }
        }
      } catch (compileError: unknown) {
        finalStatus = 'Compilation Error';
        errorMessage = (compileError as Error).message || 'Syntax Error';
      }
    } else {
      // Mock execution for other languages (Python, C++)
      // Simulate runtimes and memory allocations
      await new Promise((r) => setTimeout(r, 150));
      const hasStructure = input.sourceCode.trim().length > 20;
      if (!hasStructure) {
        finalStatus = 'Wrong Answer';
      } else {
        // 80% success rate mock simulation
        const rand = Math.random();
        if (rand < 0.05) finalStatus = 'Compilation Error';
        else if (rand < 0.15) finalStatus = 'Wrong Answer';
        else if (rand < 0.20) finalStatus = 'Runtime Error';
        else finalStatus = 'Accepted';
      }
    }

    runtime = Math.max(1, Date.now() - startTime);
    memory = Math.floor(Math.random() * 5000) + 15000; // Simulated memory 15MB - 20MB

    // Save submission to database
    const [sub] = await db
      .insert(submissions)
      .values({
        userId,
        problemId: problem.id,
        language: input.language,
        sourceCode: input.sourceCode,
        status: finalStatus,
        runtime,
        memory,
      })
      .returning();

    // Update problem acceptance statistics
    const totalSubs = problem.totalSubmissions + 1;
    const successfulSubs = problem.successfulSubmissions + (finalStatus === 'Accepted' ? 1 : 0);
    const newAcceptanceRate = parseFloat(((successfulSubs / totalSubs) * 100).toFixed(1));

    await db
      .update(problems)
      .set({
        totalSubmissions: totalSubs,
        successfulSubmissions: successfulSubs,
        acceptanceRate: newAcceptanceRate,
      })
      .where(eq(problems.id, problem.id));

    return {
      submission: sub,
      failedTestCase: failedTestCaseIndex !== -1 ? allTestCases[failedTestCaseIndex] : null,
      actualOutput: actualOutput || undefined,
      error: errorMessage || undefined,
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
    
    // Submissions should only be accessed by the creator or admin
    if (sub.userId !== userId) {
      throw new Error('Not authorized to access this submission');
    }

    const problem = await db.select().from(problems).where(eq(problems.id, sub.problemId)).limit(1).then(r => r[0]);

    return {
      ...sub,
      problemTitle: problem?.title || 'Unknown Problem',
    };
  }
}

export const submissionService = new SubmissionService();

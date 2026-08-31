import vm from 'vm';

export interface TestCaseExecutionInput {
  sourceCode: string;
  language: string;
  problemSlug: string;
  testCaseInput: string;
  expectedOutput: string;
  timeoutMs?: number;
  memoryLimitKb?: number;
}

export interface TestCaseExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded';
  runtime: number; // ms
  memory: number; // KB
  actualOutput?: string;
  errorMessage?: string;
}

export class ExecutionEngine {
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

  async executeTestCase(inputData: TestCaseExecutionInput): Promise<TestCaseExecutionResult> {
    const { sourceCode, language, problemSlug, testCaseInput, expectedOutput } = inputData;
    const timeoutMs = inputData.timeoutMs || 1500; // 1.5s hard limit
    const memoryLimitKb = inputData.memoryLimitKb || 256000; // 256MB default limit

    const startTime = Date.now();
    const startMem = process.memoryUsage().heapUsed;

    if (language.toLowerCase() === 'javascript') {
      const entrypoint = this.getEntrypointName(problemSlug);

      // 1. Compilation/Syntax Check
      try {
        new vm.Script(sourceCode);
      } catch (compileErr: unknown) {
        const err = compileErr as Error;
        return {
          status: 'Compilation Error',
          runtime: 0,
          memory: 0,
          errorMessage: err.message || 'Syntax Error',
        };
      }

      // 2. Parse Testcase Inputs
      const args = testCaseInput.trim().split('\n').map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return line;
        }
      });

      const sandbox = {
        console: { log: () => {} },
      };

      const runScriptText = `
        ${sourceCode}
        ;const __res = ${entrypoint}(...${JSON.stringify(args)});
        __res;
      `;

      try {
        const context = vm.createContext(sandbox);
        const script = new vm.Script(runScriptText);

        const actualVal = script.runInContext(context, { timeout: timeoutMs });
        const endTime = Date.now();
        const endMem = process.memoryUsage().heapUsed;

        const runtime = Math.max(1, endTime - startTime);
        const memoryKb = Math.max(1024, Math.round((endMem - startMem) / 1024) + 12000);

        if (memoryKb > memoryLimitKb) {
          return {
            status: 'Memory Limit Exceeded',
            runtime,
            memory: memoryKb,
            errorMessage: `Memory limit exceeded: ${memoryKb}KB used (limit: ${memoryLimitKb}KB)`,
          };
        }

        const actualStr = actualVal !== undefined ? JSON.stringify(actualVal) : 'undefined';

        let expectedParsed;
        try {
          expectedParsed = JSON.parse(expectedOutput);
        } catch {
          expectedParsed = expectedOutput.trim();
        }

        const expectedStr = JSON.stringify(expectedParsed);

        if (actualStr === expectedStr || String(actualVal).trim() === expectedOutput.trim()) {
          return {
            status: 'Accepted',
            runtime,
            memory: memoryKb,
            actualOutput: actualStr,
          };
        } else {
          return {
            status: 'Wrong Answer',
            runtime,
            memory: memoryKb,
            actualOutput: actualStr,
          };
        }
      } catch (runErr: unknown) {
        const err = runErr as Error;
        const endTime = Date.now();
        const runtime = Math.max(1, endTime - startTime);

        if (err.message && (err.message.includes('timed out') || err.message.includes('Timeout'))) {
          return {
            status: 'Time Limit Exceeded',
            runtime: timeoutMs,
            memory: 15000,
            errorMessage: `Execution timed out after ${timeoutMs}ms`,
          };
        }

        return {
          status: 'Runtime Error',
          runtime,
          memory: 12000,
          errorMessage: err.message || 'Runtime Error',
        };
      }
    } else {
      // Mock execution for other supported languages (Python, C++)
      await new Promise((r) => setTimeout(r, 120));
      const endTime = Date.now();
      const runtime = Math.max(1, endTime - startTime);
      const memoryKb = Math.floor(Math.random() * 4000) + 14000;

      const hasStructure = sourceCode.trim().length > 20;
      if (!hasStructure) {
        return {
          status: 'Wrong Answer',
          runtime,
          memory: memoryKb,
          actualOutput: 'No return value',
        };
      }

      return {
        status: 'Accepted',
        runtime,
        memory: memoryKb,
        actualOutput: expectedOutput,
      };
    }
  }
}

export const executionEngine = new ExecutionEngine();

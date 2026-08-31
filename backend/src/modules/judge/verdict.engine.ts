import { TestCaseExecutionResult } from './execution.engine';

export type SubmissionStatus =
  | 'Pending'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Compilation Error'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded';

export class VerdictEngine {
  // Priority order for determining overall verdict
  private priorityMap: Record<SubmissionStatus, number> = {
    'Compilation Error': 1,
    'Time Limit Exceeded': 2,
    'Memory Limit Exceeded': 3,
    'Runtime Error': 4,
    'Wrong Answer': 5,
    'Accepted': 6,
    'Pending': 7,
  };

  computeOverallVerdict(results: TestCaseExecutionResult[]): {
    status: SubmissionStatus;
    totalRuntime: number;
    maxMemory: number;
  } {
    if (results.length === 0) {
      return {
        status: 'Compilation Error',
        totalRuntime: 0,
        maxMemory: 0,
      };
    }

    let overallStatus: SubmissionStatus = 'Accepted';
    let maxRuntime = 0;
    let maxMemory = 0;

    for (const res of results) {
      if (res.runtime > maxRuntime) maxRuntime = res.runtime;
      if (res.memory > maxMemory) maxMemory = res.memory;

      const currentPriority = this.priorityMap[res.status] || 99;
      const overallPriority = this.priorityMap[overallStatus] || 99;

      if (currentPriority < overallPriority) {
        overallStatus = res.status;
      }
    }

    return {
      status: overallStatus,
      totalRuntime: maxRuntime,
      maxMemory: maxMemory,
    };
  }
}

export const verdictEngine = new VerdictEngine();

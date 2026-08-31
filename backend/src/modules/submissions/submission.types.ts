import { Submission } from '../../db/schema';

export interface CreateSubmissionInput {
  problemId: number;
  language: string;
  sourceCode: string;
}

export interface SubmissionWithProblem extends Submission {
  problem: {
    title: string;
    slug: string;
  };
}

export interface SubmissionResponse {
  submission: Submission;
}

export interface UserSubmissionsResponse {
  submissions: SubmissionWithProblem[];
}

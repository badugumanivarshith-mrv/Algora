import { Problem, Tag } from '../../db/schema';

export interface ProblemWithTags extends Problem {
  tags: Tag[];
}

export interface ProblemResponse {
  problem: ProblemWithTags;
}

export interface ProblemsListResponse {
  problems: (Problem & { tags: Tag[] })[];
}

export interface CreateProblemInput {
  title: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: Record<string, string>;
  solutionTemplate?: string;
  tagIds?: number[];
}

export interface CreateTestCaseInput {
  problemId: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

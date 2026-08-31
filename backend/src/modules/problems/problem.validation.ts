import { z } from 'zod';

export const createProblemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  constraints: z.array(z.string()).default([]),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional()
  })).default([]),
  starterCode: z.record(z.string()).default({}),
  solutionTemplate: z.string().optional(),
  tagIds: z.array(z.number()).optional()
});

export const updateProblemSchema = createProblemSchema.partial();

export const createTestCaseSchema = z.object({
  problemId: z.number(),
  input: z.string().min(1, 'Input is required'),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  isHidden: z.boolean().default(false)
});

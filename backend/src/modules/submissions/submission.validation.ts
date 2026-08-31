import { z } from 'zod';

export const createSubmissionSchema = z.object({
  problemId: z.number({ required_error: 'Problem ID is required' }),
  language: z.string().min(1, 'Language is required'),
  sourceCode: z.string().min(1, 'Source code is required'),
});

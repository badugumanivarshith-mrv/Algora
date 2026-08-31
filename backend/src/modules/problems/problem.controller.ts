import { Request, Response } from 'express';
import { problemService } from './problem.service';
import { createProblemSchema, updateProblemSchema, createTestCaseSchema } from './problem.validation';

export class ProblemController {
  async getProblems(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const difficulty = req.query.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined;
      const tag = req.query.tag as string | undefined;

      const problemsList = await problemService.getProblems({ search, difficulty, tag });
      res.json({ problems: problemsList });
    } catch (error: unknown) {
      console.error('Error fetching problems:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getProblemBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug;
      const problem = await problemService.getProblemBySlug(slug);

      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      res.json({ problem });
    } catch (error: unknown) {
      console.error('Error fetching problem by slug:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async createProblem(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createProblemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const problem = await problemService.createProblem(parsed.data);
      res.status(201).json({ message: 'Problem created successfully', problem });
    } catch (error: unknown) {
      console.error('Error creating problem:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async updateProblem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid problem ID' });
        return;
      }

      const parsed = updateProblemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const problem = await problemService.updateProblem(id, parsed.data);
      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      res.json({ message: 'Problem updated successfully', problem });
    } catch (error: unknown) {
      console.error('Error updating problem:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async deleteProblem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid problem ID' });
        return;
      }

      const success = await problemService.deleteProblem(id);
      if (!success) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      res.json({ message: 'Problem deleted successfully' });
    } catch (error: unknown) {
      console.error('Error deleting problem:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const tagsList = await problemService.getTags();
      res.json({ tags: tagsList });
    } catch (error: unknown) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getTestCases(req: Request, res: Response): Promise<void> {
    try {
      const problemId = parseInt(req.params.id, 10);
      if (isNaN(problemId)) {
        res.status(400).json({ error: 'Invalid problem ID' });
        return;
      }

      // Check if problem exists
      const problem = await problemService.getProblemById(problemId);
      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      // Return public test cases only for regular user fetch
      const testCasesList = await problemService.getTestCases(problemId, false);
      res.json({ testCases: testCasesList });
    } catch (error: unknown) {
      console.error('Error fetching test cases:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async createTestCase(req: Request, res: Response): Promise<void> {
    try {
      const problemId = parseInt(req.params.id, 10);
      if (isNaN(problemId)) {
        res.status(400).json({ error: 'Invalid problem ID' });
        return;
      }

      // Check if problem exists
      const problem = await problemService.getProblemById(problemId);
      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      const bodyData = { ...req.body, problemId };
      const parsed = createTestCaseSchema.safeParse(bodyData);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const testCase = await problemService.createTestCase(parsed.data);
      res.status(201).json({ message: 'Test case created successfully', testCase });
    } catch (error: unknown) {
      console.error('Error creating test case:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }
}

export const problemController = new ProblemController();

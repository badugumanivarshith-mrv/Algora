import { Request, Response } from 'express';
import { submissionService } from './submission.service';
import { createSubmissionSchema } from './submission.validation';

export class SubmissionController {
  async submitSolution(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      // Check user authentication
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized session' });
        return;
      }

      const result = await submissionService.submitSolution(req.user.id, parsed.data);
      res.status(201).json({
        message: 'Solution evaluated successfully',
        ...result,
      });
    } catch (error: unknown) {
      console.error('Error submitting solution:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getMySubmissions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized session' });
        return;
      }

      const list = await submissionService.getMySubmissions(req.user.id);
      res.json({ submissions: list });
    } catch (error: unknown) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getSubmissionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid submission ID' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized session' });
        return;
      }

      const submission = await submissionService.getSubmissionById(id, req.user.id);
      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      res.json({ submission });
    } catch (error: unknown) {
      console.error('Error fetching submission details:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }
}

export const submissionController = new SubmissionController();

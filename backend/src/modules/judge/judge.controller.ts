import { Request, Response } from 'express';
import { judgeService } from './judge.service';

export class JudgeController {
  async getJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await judgeService.getJobs();
      res.json({ jobs });
    } catch (error: unknown) {
      console.error('Error fetching judge jobs:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid job ID' });
        return;
      }

      const job = await judgeService.getJobById(id);
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      res.json({ job });
    } catch (error: unknown) {
      console.error('Error fetching judge job:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getSubmissionResults(req: Request, res: Response): Promise<void> {
    try {
      const submissionId = parseInt(req.params.id, 10);
      if (isNaN(submissionId)) {
        res.status(400).json({ error: 'Invalid submission ID' });
        return;
      }

      const results = await judgeService.getSubmissionResults(submissionId);
      res.json({ results });
    } catch (error: unknown) {
      console.error('Error fetching submission results:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }
}

export const judgeController = new JudgeController();

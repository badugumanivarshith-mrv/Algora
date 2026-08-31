import { Request, Response } from 'express';
import { leaderboardService } from './leaderboard.service';

export class LeaderboardController {
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const rankings = await leaderboardService.getGlobalRankings();
      res.json({ rankings });
    } catch (error: unknown) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }

  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const progress = await leaderboardService.getUserProgress(req.user.id);
      res.json({ progress });
    } catch (error: unknown) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  }
}

export const leaderboardController = new LeaderboardController();

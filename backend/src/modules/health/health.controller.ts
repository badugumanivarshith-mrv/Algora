import { Request, Response } from 'express';
import { HealthService } from './health.service';

export class HealthController {
  private healthService = new HealthService();

  getHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.healthService.checkDatabase();

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: 'connected',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown database error',
      });
    }
  };
}

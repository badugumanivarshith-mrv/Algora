import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Perform simple query to verify database connectivity
    await db.execute(sql`SELECT 1`);

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
});

export default router;

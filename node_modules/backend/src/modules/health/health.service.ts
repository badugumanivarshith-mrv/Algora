import { db } from '../../db';
import { sql } from 'drizzle-orm';

export class HealthService {
  async checkDatabase(): Promise<void> {
    await db.execute(sql`SELECT 1`);
  }
}

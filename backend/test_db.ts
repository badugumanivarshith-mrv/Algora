import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function testDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully.');

    const tables = [
      'users',
      'problems',
      'tags',
      'problem_tags',
      'test_cases',
      'submissions',
      'submission_results',
      'execution_jobs',
      'solved_problems'
    ];

    console.log('\n--- Row Counts ---');
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table}: ${res.rows[0].count}`);
      } catch (err: any) {
        console.error(`Error querying ${table}: ${err.message}`);
      }
    }
  } catch (err: any) {
    console.error('Connection error', err.stack);
  } finally {
    await client.end();
  }
}

testDb();

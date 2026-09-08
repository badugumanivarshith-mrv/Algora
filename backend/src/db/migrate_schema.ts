import { Client } from 'pg';

async function migrateSchema() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Mani@8239@localhost:5432/algora_dev';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Migrating database schema columns...');

    await client.query(`
      -- Ensure user_streaks columns
      ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP;
      ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0 NOT NULL;
      ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0 NOT NULL;

      -- Ensure user_xp columns
      ALTER TABLE user_xp ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0 NOT NULL;
      ALTER TABLE user_xp ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 NOT NULL;

      -- Ensure achievements columns
      ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General' NOT NULL;
      ALTER TABLE achievements ADD COLUMN IF NOT EXISTS icon VARCHAR(256) DEFAULT '🏆' NOT NULL;
      ALTER TABLE achievements ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0 NOT NULL;

      -- Ensure user_activity columns
      ALTER TABLE user_activity ADD COLUMN IF NOT EXISTS problem_id INTEGER REFERENCES problems(id) ON DELETE SET NULL;
      ALTER TABLE user_activity ADD COLUMN IF NOT EXISTS action VARCHAR(100);
      ALTER TABLE user_activity ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
      
      -- If legacy activity_type column exists, drop NOT NULL constraint or sync default
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activity' AND column_name='activity_type') THEN
          ALTER TABLE user_activity ALTER COLUMN activity_type DROP NOT NULL;
        END IF;
      END $$;
    `);

    console.log('✅ Schema migration completed successfully.');
  } catch (err) {
    console.error('❌ Schema migration failed:', err);
  } finally {
    await client.end();
  }
}

migrateSchema();

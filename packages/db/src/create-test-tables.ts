import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || 'postgresql://anderskarlsson@localhost:5432/robo_test',
});

async function createTestTables() {
  try {
    // Create task_assignments table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL,
        user_id UUID NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'claimed',
        claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        submitted_at TIMESTAMP,
        completed_at TIMESTAMP,
        completion_notes TEXT,
        completion_data JSONB DEFAULT '{}',
        approved_by_user_id UUID,
        approval_notes TEXT,
        points_awarded INTEGER,
        coop_group_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Test tables created successfully!');
  } catch (error) {
    console.error('Error creating test tables:', error);
  } finally {
    await pool.end();
  }
}

createTestTables();
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Use a separate test database
const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || 'postgresql://anderskarlsson@localhost:5432/robo_test',
});

export const testDb = drizzle(testPool);

export async function cleanupTestDb() {
  // Clean up all tables in reverse order of dependencies
  const tables = [
    'point_transactions',
    'streaks',
    'mini_game_scores',
    'user_badges',
    'user_labs',
    'user_skills',
    'leaderboard_entries',
    'task_completions',
    'task_claims',
    'coop_participants',
    'reactions',
    'message_reads',
    'community_messages',
    'activities',
    'lab_visits',
    'event_participants',
    'user_seasons',
    'bootcamp_progress',
    'user_stats',
    'audit_logs',
    'support_tickets',
    'admin_notes',
    'platform_bans',
    'platform_access_logs',
    'platform_settings',
    'sessions',
    'user_communities',
    'tasks',
    'events',
    'subscriptions',
    'task_templates',
    'analytics_events',
    'announcements',
    'feature_flags',
    'seasons',
    'badges',
    'communities',
    'users',
  ];

  for (const table of tables) {
    try {
      await testPool.query(`DELETE FROM ${table}`);
    } catch (error) {
      console.error(`Failed to delete from ${table}:`, error.message);
    }
  }
}

export async function closeTestDb() {
  await testPool.end();
}
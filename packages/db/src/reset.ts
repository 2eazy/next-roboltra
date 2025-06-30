import { sql } from 'drizzle-orm';
import { db } from './index.js';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function reset() {
  console.log('Resetting database...');
  
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://anderskarlsson@localhost:5432/robo_dev';
  const dbName = 'robo_dev';
  
  // Connect to postgres database to drop and recreate
  const adminPool = new Pool({
    connectionString: databaseUrl.replace(`/${dbName}`, '/postgres'),
  });
  
  try {
    // Drop existing connections
    await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid();
    `);
    
    // Drop and recreate database
    await adminPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    
    console.log('Database reset complete!');
    
    // Run migrations
    console.log('Running migrations...');
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

reset();
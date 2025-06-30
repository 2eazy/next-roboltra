import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Find the root .env file properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

dotenv.config({ path: join(rootDir, '.env') });

// Use the connection string from docker-compose
const connectionString = process.env.DATABASE_URL || 'postgresql://robo:robopass@localhost:5432/robo_dev';

console.log('Connecting to database:', connectionString);

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool);

export * from './schema/index';
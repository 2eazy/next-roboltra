import { db } from "./src";
import { sql } from "drizzle-orm";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("Running migrations...");
    
    // Add game columns to user_stats
    console.log("1. Adding game columns to user_stats...");
    const gameColumnsSQL = `
      ALTER TABLE user_stats 
      ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS max_stamina INTEGER NOT NULL DEFAULT 100;
    `;
    await db.execute(sql.raw(gameColumnsSQL));
    
    // Create tasks table
    console.log("2. Creating tasks table...");
    const tasksTableSQL = fs.readFileSync(
      path.join(__dirname, "./src/migrations/create-tasks-table.sql"),
      "utf-8"
    );
    await db.execute(sql.raw(tasksTableSQL));
    
    // Create user_skills table
    console.log("3. Creating user_skills table...");
    const userSkillsSQL = fs.readFileSync(
      path.join(__dirname, "./src/migrations/create-user-skills.sql"),
      "utf-8"
    );
    await db.execute(sql.raw(userSkillsSQL));
    
    console.log("All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
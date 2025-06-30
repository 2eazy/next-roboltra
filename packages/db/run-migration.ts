import { db } from "./src";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Running migration to add game columns...");
    
    const migrationSQL = `
      ALTER TABLE user_stats 
      ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS max_stamina INTEGER NOT NULL DEFAULT 100;
    `;
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
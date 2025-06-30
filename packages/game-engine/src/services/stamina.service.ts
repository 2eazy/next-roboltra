import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";
import { gameConfig, TaskCategory } from "../config";

export interface StaminaInfo {
  current: number;
  max: number;
  timeUntilNextRegen?: number; // in seconds
}

export class StaminaService {
  /**
   * Get current stamina for a user
   */
  async getCurrentStamina(userId: string): Promise<StaminaInfo> {
    const query = sql`
      SELECT 
        current_stamina,
        max_stamina,
        last_stamina_update,
        level
      FROM user_stats
      WHERE user_id = ${userId}
    `;

    const result = await db.execute(query);
    const stats = result.rows[0];

    if (!stats) {
      // Initialize user stats if not found
      await this.initializeUserStats(userId);
      return { current: gameConfig.stamina.base, max: gameConfig.stamina.base };
    }

    // Calculate regenerated stamina
    const now = new Date();
    const lastUpdate = new Date(stats.last_stamina_update);
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
    const hoursElapsed = timeSinceUpdate / gameConfig.stamina.regenerationInterval;
    const regenerated = Math.floor(hoursElapsed * gameConfig.stamina.regenerationRate);

    // Calculate max stamina based on level
    const level = Number(stats.level) || 1;
    let maxStamina = gameConfig.stamina.base;
    
    if (level >= 50) {
      maxStamina = gameConfig.stamina.upgrades.level50;
    } else if (level >= 25) {
      maxStamina = gameConfig.stamina.upgrades.level25;
    } else if (level >= 10) {
      maxStamina = gameConfig.stamina.upgrades.level10;
    }

    const currentStamina = Math.min(
      Number(stats.current_stamina) + regenerated,
      maxStamina
    );

    // Update if regeneration occurred
    if (regenerated > 0) {
      const updateQuery = sql`
        UPDATE user_stats
        SET 
          current_stamina = ${currentStamina},
          last_stamina_update = NOW()
        WHERE user_id = ${userId}
      `;
      await db.execute(updateQuery);
    }

    // Calculate time until next regen
    let timeUntilNextRegen = 0;
    if (currentStamina < maxStamina) {
      const timeUntilNextHour = gameConfig.stamina.regenerationInterval - 
        (timeSinceUpdate % gameConfig.stamina.regenerationInterval);
      timeUntilNextRegen = Math.ceil(timeUntilNextHour / 1000); // Convert to seconds
    }

    return { current: currentStamina, max: maxStamina, timeUntilNextRegen };
  }

  /**
   * Consume stamina for claiming a task
   */
  async consumeStaminaForTask(
    userId: string,
    taskCategory: TaskCategory
  ): Promise<{ success: boolean; remaining: number }> {
    const cost = gameConfig.stamina.costs.claimTask[taskCategory];
    const { current } = await this.getCurrentStamina(userId);

    if (current < cost) {
      return { success: false, remaining: current };
    }

    // Deduct stamina
    const updateQuery = sql`
      UPDATE user_stats
      SET 
        current_stamina = current_stamina - ${cost},
        last_stamina_update = NOW()
      WHERE user_id = ${userId}
    `;
    
    await db.execute(updateQuery);

    return { success: true, remaining: current - cost };
  }

  /**
   * Check if user has enough stamina for a task
   */
  async hasStaminaForTask(
    userId: string,
    taskCategory: TaskCategory
  ): Promise<boolean> {
    const cost = gameConfig.stamina.costs.claimTask[taskCategory];
    const { current } = await this.getCurrentStamina(userId);
    return current >= cost;
  }

  /**
   * Initialize user stats if not found
   */
  private async initializeUserStats(userId: string): Promise<void> {
    const query = sql`
      INSERT INTO user_stats (
        user_id,
        total_points,
        current_streak,
        current_stamina,
        max_stamina,
        level,
        last_stamina_update,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        0,
        0,
        ${gameConfig.stamina.base},
        ${gameConfig.stamina.base},
        1,
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING
    `;

    await db.execute(query);
  }
}
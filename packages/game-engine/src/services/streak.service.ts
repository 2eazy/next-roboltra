import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";
import { gameConfig } from "../config";

export class StreakService {
  /**
   * Update user's streak when completing a task
   */
  async updateStreak(userId: string): Promise<number> {
    // Check if user completed a task today
    const todayQuery = sql`
      SELECT COUNT(*) as count
      FROM task_completions
      WHERE user_id = ${userId}
        AND completed_at >= CURRENT_DATE
        AND completed_at < CURRENT_DATE + INTERVAL '1 day'
    `;

    const todayResult = await db.execute(todayQuery);
    const tasksToday = Number(todayResult.rows[0]?.count) || 0;

    // If this is the first task today, update streak
    if (tasksToday === 1) {
      // Check if user completed tasks yesterday
      const yesterdayQuery = sql`
        SELECT COUNT(*) as count
        FROM task_completions
        WHERE user_id = ${userId}
          AND completed_at >= CURRENT_DATE - INTERVAL '1 day'
          AND completed_at < CURRENT_DATE
      `;

      const yesterdayResult = await db.execute(yesterdayQuery);
      const tasksYesterday = Number(yesterdayResult.rows[0]?.count) || 0;

      if (tasksYesterday > 0) {
        // Continue streak
        const updateQuery = sql`
          UPDATE user_stats
          SET 
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            updated_at = NOW()
          WHERE user_id = ${userId}
          RETURNING current_streak
        `;

        const result = await db.execute(updateQuery);
        return Number(result.rows[0]?.current_streak) || 1;
      } else {
        // Reset streak to 1
        const resetQuery = sql`
          UPDATE user_stats
          SET 
            current_streak = 1,
            updated_at = NOW()
          WHERE user_id = ${userId}
          RETURNING current_streak
        `;

        const result = await db.execute(resetQuery);
        return 1;
      }
    }

    // Return current streak
    const getCurrentQuery = sql`
      SELECT current_streak
      FROM user_stats
      WHERE user_id = ${userId}
    `;

    const currentResult = await db.execute(getCurrentQuery);
    return Number(currentResult.rows[0]?.current_streak) || 0;
  }

  /**
   * Check and reset streaks if needed (run daily at reset hour)
   */
  async checkAndResetStreaks(): Promise<void> {
    // Find users who haven't completed tasks today
    const resetQuery = sql`
      UPDATE user_stats
      SET 
        current_streak = 0,
        updated_at = NOW()
      WHERE user_id IN (
        SELECT us.user_id
        FROM user_stats us
        WHERE us.current_streak > 0
          AND NOT EXISTS (
            SELECT 1
            FROM task_completions tc
            WHERE tc.user_id = us.user_id
              AND tc.completed_at >= CURRENT_DATE
          )
      )
    `;

    await db.execute(resetQuery);
  }

  /**
   * Get streak milestones and rewards
   */
  getStreakMilestones(currentStreak: number): {
    nextMilestone: number | null;
    currentMilestone: number | null;
    bonusMultiplier: number;
  } {
    const milestones = gameConfig.streaks.milestones;
    
    // Find current and next milestone
    let currentMilestone = null;
    let nextMilestone = null;
    
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (currentStreak >= milestones[i]) {
        currentMilestone = milestones[i];
        nextMilestone = milestones[i + 1] || null;
        break;
      }
    }
    
    if (currentMilestone === null && milestones.length > 0) {
      nextMilestone = milestones[0];
    }

    // Calculate bonus multiplier
    const multiplier = Math.min(
      1 + (currentStreak / 10) * gameConfig.streaks.bonusMultiplier,
      gameConfig.streaks.maxMultiplier
    );

    return {
      currentMilestone,
      nextMilestone,
      bonusMultiplier: multiplier,
    };
  }
}
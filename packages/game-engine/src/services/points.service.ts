import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";
import { gameConfig, TaskCategory } from "../config";

export interface PointsBreakdown {
  base: number;
  streakBonus: number;
  total: number;
}

export class PointsService {
  /**
   * Award points to a user
   */
  async awardPoints(
    userId: string,
    amount: number,
    type: string,
    metadata?: Record<string, any>
  ): Promise<{
    breakdown: PointsBreakdown;
    newTotal: number;
  }> {
    // Get current streak for bonus calculation
    const currentStreak = await this.getCurrentStreak(userId);
    const streakBonus = this.calculateStreakBonus(amount, currentStreak);
    const totalAmount = amount + streakBonus;

    // Update user stats using raw SQL to avoid schema conflicts
    const updateQuery = sql`
      UPDATE user_stats
      SET 
        total_points = total_points + ${totalAmount},
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING total_points
    `;

    const result = await db.execute(updateQuery);
    const newTotal = result.rows[0]?.total_points || 0;

    // Record transaction
    const transactionQuery = sql`
      INSERT INTO point_transactions (user_id, amount, type, metadata, created_at)
      VALUES (${userId}, ${totalAmount}, ${type}, ${sql.raw(`'${JSON.stringify({
        ...metadata,
        baseAmount: amount,
        streakBonus,
        streakDays: currentStreak,
      })}'::jsonb`)}, NOW())
    `;

    await db.execute(transactionQuery);

    return {
      breakdown: {
        base: amount,
        streakBonus,
        total: totalAmount,
      },
      newTotal: Number(newTotal),
    };
  }

  /**
   * Award task completion points
   */
  async awardTaskPoints(
    userId: string,
    taskCategory: TaskCategory,
    metadata: {
      taskId: string;
      isFirstDaily?: boolean;
      isSpeedBonus?: boolean;
    }
  ) {
    let totalPoints = gameConfig.points.taskCompletion[taskCategory];

    // Add bonuses
    if (metadata.isFirstDaily) {
      totalPoints += gameConfig.points.bonuses.firstDailyTask;
    }
    if (metadata.isSpeedBonus) {
      totalPoints += gameConfig.points.bonuses.speedBonus;
    }

    return this.awardPoints(userId, totalPoints, "task_completion", metadata);
  }

  /**
   * Get points earned today
   */
  async getPointsToday(userId: string): Promise<number> {
    const query = sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM point_transactions
      WHERE user_id = ${userId}
        AND created_at >= CURRENT_DATE
        AND amount > 0
    `;

    const result = await db.execute(query);
    return Number(result.rows[0]?.total) || 0;
  }

  /**
   * Get user's current streak (simplified for now)
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    const query = sql`
      SELECT current_streak
      FROM user_stats
      WHERE user_id = ${userId}
    `;

    const result = await db.execute(query);
    return Number(result.rows[0]?.current_streak) || 0;
  }

  /**
   * Calculate streak bonus
   */
  private calculateStreakBonus(baseAmount: number, streakDays: number): number {
    if (streakDays < 3) return 0; // No bonus until 3-day streak
    
    const multiplier = Math.min(
      Math.floor(streakDays / 10) * gameConfig.streaks.bonusMultiplier,
      gameConfig.streaks.maxMultiplier - 1
    );
    return Math.floor(baseAmount * multiplier);
  }
}
import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";
import { gameConfig, SkillTreeCategory } from "../config";

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

export class XPService {
  /**
   * Award XP to a user (usually from points)
   */
  async awardXP(
    userId: string,
    amount: number,
    skillTree?: SkillTreeCategory
  ): Promise<{
    totalXP: number;
    leveledUp: boolean;
    newLevel?: number;
  }> {
    // Award general XP
    const updateQuery = sql`
      UPDATE user_stats
      SET 
        total_xp = total_xp + ${amount},
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING total_xp, level
    `;

    const result = await db.execute(updateQuery);
    const totalXP = Number(result.rows[0]?.total_xp) || 0;
    const currentLevel = Number(result.rows[0]?.level) || 1;

    // Check for level up
    const newLevel = this.calculateLevel(totalXP);
    const leveledUp = newLevel > currentLevel;

    if (leveledUp) {
      // Update level
      const levelQuery = sql`
        UPDATE user_stats
        SET level = ${newLevel}
        WHERE user_id = ${userId}
      `;
      await db.execute(levelQuery);
    }

    // Award skill-specific XP if specified
    if (skillTree) {
      await this.awardSkillXP(userId, skillTree, amount);
    }

    return {
      totalXP,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  }

  /**
   * Award XP to a specific skill tree
   */
  async awardSkillXP(
    userId: string,
    skillTree: SkillTreeCategory,
    amount: number
  ): Promise<void> {
    const query = sql`
      INSERT INTO user_skills (user_id, skill_tree, xp, level, updated_at)
      VALUES (${userId}, ${skillTree}, ${amount}, 1, NOW())
      ON CONFLICT (user_id, skill_tree)
      DO UPDATE SET
        xp = user_skills.xp + ${amount},
        level = LEAST(
          FLOOR((user_skills.xp + ${amount}) / ${gameConfig.skillTrees.xpPerLevel}) + 1,
          ${gameConfig.skillTrees.maxLevel}
        ),
        updated_at = NOW()
    `;

    await db.execute(query);
  }

  /**
   * Get user's level info
   */
  async getLevelInfo(userId: string): Promise<LevelInfo> {
    const query = sql`
      SELECT total_xp, level
      FROM user_stats
      WHERE user_id = ${userId}
    `;

    const result = await db.execute(query);
    const stats = result.rows[0];
    
    const totalXP = Number(stats?.total_xp) || 0;
    const currentLevel = Number(stats?.level) || 1;
    
    const xpForCurrentLevel = this.getXPForLevel(currentLevel);
    const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
    const xpProgress = totalXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = Math.min((xpProgress / xpNeeded) * 100, 100);

    return {
      currentLevel,
      currentXP: totalXP,
      xpForNextLevel,
      progressPercentage,
    };
  }

  /**
   * Get user's skill tree progress
   */
  async getSkillTreeProgress(userId: string): Promise<Record<SkillTreeCategory, {
    level: number;
    xp: number;
    progressPercentage: number;
  }>> {
    const query = sql`
      SELECT skill_tree, xp, level
      FROM user_skills
      WHERE user_id = ${userId}
    `;

    const result = await db.execute(query);
    
    const progress: Record<string, any> = {};
    
    // Initialize all skill trees
    for (const skillTree of gameConfig.skillTrees.categories) {
      progress[skillTree] = {
        level: 0,
        xp: 0,
        progressPercentage: 0,
      };
    }

    // Update with actual data
    for (const row of result.rows) {
      const xp = Number(row.xp) || 0;
      const level = Number(row.level) || 0;
      const xpInCurrentLevel = xp % gameConfig.skillTrees.xpPerLevel;
      const progressPercentage = (xpInCurrentLevel / gameConfig.skillTrees.xpPerLevel) * 100;

      progress[row.skill_tree as string] = {
        level,
        xp,
        progressPercentage,
      };
    }

    return progress as Record<SkillTreeCategory, any>;
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevel(totalXP: number): number {
    let level = 1;
    let xpRequired = 0;

    while (level < gameConfig.xp.maxLevel) {
      xpRequired += gameConfig.xp.levelFormula(level);
      if (totalXP < xpRequired) break;
      level++;
    }

    return level;
  }

  /**
   * Get total XP required for a specific level
   */
  private getXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += gameConfig.xp.levelFormula(i);
    }
    return totalXP;
  }
}
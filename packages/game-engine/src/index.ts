export * from "./config";
export * from "./services/points.service";
export * from "./services/stamina.service";
export * from "./services/streak.service";
export * from "./services/xp.service";

// Create service instances
import { PointsService } from "./services/points.service";
import { StaminaService } from "./services/stamina.service";
import { StreakService } from "./services/streak.service";
import { XPService } from "./services/xp.service";

export const pointsService = new PointsService();
export const staminaService = new StaminaService();
export const streakService = new StreakService();
export const xpService = new XPService();

// Game engine facade for coordinated operations
export class GameEngine {
  constructor(
    private points = pointsService,
    private stamina = staminaService,
    private streak = streakService,
    private xp = xpService
  ) {}

  /**
   * Complete a task and handle all game mechanics
   */
  async completeTask(
    userId: string,
    taskId: string,
    taskCategory: keyof typeof gameConfig.points.taskCompletion,
    metadata?: {
      isFirstDaily?: boolean;
      isSpeedBonus?: boolean;
      skillTree?: SkillTreeCategory;
    }
  ) {
    // Update streak
    const currentStreak = await this.streak.updateStreak(userId);

    // Award points
    const pointsResult = await this.points.awardTaskPoints(userId, taskCategory, {
      taskId,
      ...metadata,
    });

    // Award XP
    const xpAmount = pointsResult.breakdown.total * gameConfig.xp.perPoint;
    const xpResult = await this.xp.awardXP(userId, xpAmount, metadata?.skillTree);

    return {
      points: pointsResult,
      streak: currentStreak,
      xp: xpResult,
    };
  }

  /**
   * Claim a task (consume stamina)
   */
  async claimTask(userId: string, taskCategory: keyof typeof gameConfig.points.taskCompletion) {
    return this.stamina.consumeStaminaForTask(userId, taskCategory);
  }

  /**
   * Get comprehensive user stats
   */
  async getUserStats(userId: string) {
    const [stamina, levelInfo, skillProgress, pointsToday] = await Promise.all([
      this.stamina.getCurrentStamina(userId),
      this.xp.getLevelInfo(userId),
      this.xp.getSkillTreeProgress(userId),
      this.points.getPointsToday(userId),
    ]);

    return {
      stamina,
      level: levelInfo,
      skills: skillProgress,
      pointsToday,
    };
  }
}

export const gameEngine = new GameEngine();

// Import types
import { gameConfig, SkillTreeCategory } from "./config";
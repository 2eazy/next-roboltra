export const gameConfig = {
  // Points & XP
  points: {
    taskCompletion: {
      quick: 10,
      standard: 25,
      epic: 50,
      legendary: 100,
    },
    bonuses: {
      firstDailyTask: 5,
      speedBonus: 10, // Complete within 30 mins of claiming
      perfectDay: 50, // Complete all assigned tasks
      weeklyStreak: 100,
    },
  },
  
  // XP progression
  xp: {
    perPoint: 1, // 1 XP per point earned
    levelFormula: (level: number) => level * 1000, // XP needed for next level
    maxLevel: 99,
  },
  
  // Stamina system
  stamina: {
    base: 100,
    regenerationRate: 20, // Per hour (as per MVP doc)
    regenerationInterval: 1000 * 60 * 60, // 1 hour in ms
    costs: {
      claimTask: {
        quick: 5,
        standard: 10,
        epic: 20,
        legendary: 30,
      },
      playMiniGame: 10,
      boostReward: 20, // Double rewards for a task
    },
    upgrades: {
      level10: 120,
      level25: 150,
      level50: 200,
    },
  },
  
  // Streak system
  streaks: {
    resetHour: 3, // 3 AM local time
    milestones: [3, 7, 14, 30, 60, 100, 365], // Days
    bonusMultiplier: 0.1, // 10% point bonus per 10-day streak
    maxMultiplier: 2.0, // 200% max bonus
  },
  
  // Skill trees
  skillTrees: {
    categories: ["culinary", "domestic", "logistics", "maintenance", "habits"] as const,
    maxLevel: 10,
    xpPerLevel: 1000,
  },
  
  // Time limits
  timeLimits: {
    taskClaimExpiry: 1000 * 60 * 60 * 24, // 24 hours
    miniGameCooldown: 1000 * 60 * 30, // 30 minutes
    reactionCooldown: 1000 * 60, // 1 minute
  },
  
  // Social features
  social: {
    maxReactionsPerDay: 10,
    maxReactionsPerTask: 3,
    reactionBonus: 5, // Points for giving a reaction
    reactions: ["❤️", "👏", "🔥", "😎", "🌟"] as const,
    maxCoopMembers: 3,
    coopBonusMultiplier: 1.5, // 50% bonus for co-op tasks
  },
} as const;

export type GameConfig = typeof gameConfig;
export type TaskCategory = keyof typeof gameConfig.points.taskCompletion;
export type SkillTreeCategory = typeof gameConfig.skillTrees.categories[number];
export type ReactionType = typeof gameConfig.social.reactions[number];
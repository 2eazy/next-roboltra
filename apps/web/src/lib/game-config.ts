// Client-safe game configuration (no database imports)
export const gameConfig = {
  points: {
    taskCompletion: {
      quick: 10,
      standard: 25,
      epic: 50,
      legendary: 100,
    },
    bonuses: {
      firstDailyTask: 5,
      speedBonus: 10,
      perfectDay: 50,
      weeklyStreak: 100,
    },
  },
  
  stamina: {
    base: 100,
    regenerationRate: 20,
    regenerationInterval: 1000 * 60 * 60,
    costs: {
      claimTask: {
        quick: 5,
        standard: 10,
        epic: 20,
        legendary: 30,
      },
      playMiniGame: 10,
      boostReward: 20,
    },
    upgrades: {
      level10: 120,
      level25: 150,
      level50: 200,
    },
  },
  
  streaks: {
    resetHour: 3,
    milestones: [3, 7, 14, 30, 60, 100, 365],
    bonusMultiplier: 0.1,
    maxMultiplier: 2.0,
  },
  
  skillTrees: {
    categories: ["culinary", "domestic", "logistics", "maintenance", "habits"] as const,
    maxLevel: 10,
    xpPerLevel: 1000,
  },
  
  social: {
    maxReactionsPerDay: 10,
    maxReactionsPerTask: 3,
    reactionBonus: 5,
    reactions: ["❤️", "👏", "🔥", "😎", "🌟"] as const,
    maxCoopMembers: 3,
    coopBonusMultiplier: 1.5,
  },
} as const;

export type TaskCategory = keyof typeof gameConfig.points.taskCompletion;
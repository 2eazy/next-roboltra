import { pgTable, pgEnum, uuid, text, timestamp, integer, boolean, jsonb, decimal, unique } from 'drizzle-orm/pg-core';
import { skillTreeEnum } from './enums';
import { users, communities } from './users';

// User game stats
export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  
  // Core stats
  totalPoints: integer('total_points').notNull().default(0),
  totalXp: integer('total_xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  totalTasksCompleted: integer('total_tasks_completed').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: timestamp('last_active_date'),
  
  // Stamina
  currentStamina: integer('current_stamina').notNull().default(100),
  maxStamina: integer('max_stamina').notNull().default(100),
  lastStaminaUpdate: timestamp('last_stamina_update').notNull().defaultNow(),
  
  // Social
  reactionsGiven: integer('reactions_given').notNull().default(0),
  reactionsReceived: integer('reactions_received').notNull().default(0),
  reactionsGivenToday: integer('reactions_given_today').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Skill progression
export const userSkills = pgTable('user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  skillTree: skillTreeEnum('skill_tree').notNull(),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  unlockedPerks: jsonb('unlocked_perks').notNull().default([]), // string[]
}, (table) => ({
  uniqueUserSkill: unique().on(table.userId, table.skillTree),
}));

// Personal lab/space
export const userLabs = pgTable('user_labs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  level: integer('level').notNull().default(1), // 1-4: Starter Lab, Tech Workshop, Innovation Hub, Master Complex
  theme: text('theme').notNull().default('default'),
  layout: jsonb('layout').notNull().default({}), // { rooms: Room[], decorations: Decoration[] }
  visitPermissions: text('visit_permissions').notNull().default('family'), // 'private' | 'family' | 'friends'
  totalVisits: integer('total_visits').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Badges and achievements
export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // e.g., 'early_bird', 'perfectionist'
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category').notNull(), // 'streak', 'skill', 'cooperation', 'event', 'hidden'
  requirements: jsonb('requirements').notNull(), // { type: string, value: number, ... }
  isHidden: boolean('is_hidden').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const userBadges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  badgeId: uuid('badge_id').notNull().references(() => badges.id),
  earnedAt: timestamp('earned_at').notNull().defaultNow(),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'), // For multi-step badges
}, (table) => ({
  uniqueUserBadge: unique().on(table.userId, table.badgeId),
}));

// Leaderboards (community-only in MVP)
export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp('period_start').notNull(),
  category: text('category').notNull(), // 'points', 'tasks', 'streak', skillTree values
  value: integer('value').notNull(),
  rank: integer('rank').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Mini-game scores (local-first, only high scores sync)
export const miniGameScores = pgTable('mini_game_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  gameId: text('game_id').notNull(), // 'robo_runner', 'circuit_connect', etc.
  highScore: integer('high_score').notNull(),
  totalPlays: integer('total_plays').notNull().default(1),
  lastPlayed: timestamp('last_played').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserGame: unique().on(table.userId, table.gameId),
}));

// Streaks tracking
export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  length: integer('length').notNull(),
  type: text('type').notNull().default('daily'), // 'daily', 'skill_specific'
  skillTree: skillTreeEnum('skill_tree'), // null for general streaks
  isCurrent: boolean('is_current').notNull().default(true),
});

// Point transaction types
export const pointTransactionTypeEnum = pgEnum('point_transaction_type', [
  'task_completion',
  'mini_game',
  'reaction_given',
  'reaction_received',
  'bonus',
  'purchase',
  'refund',
  'admin_adjustment',
]);

// Point transactions for tracking
export const pointTransactions = pgTable('point_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(), // Can be negative for deductions
  type: pointTransactionTypeEnum('type').notNull(),
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
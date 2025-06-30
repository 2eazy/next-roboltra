import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, varchar, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users, communities } from './users';
import { seasons } from './seasons';

// Onboarding flow tracking
export const onboardingFlows = pgTable('onboarding_flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  captainId: uuid('captain_id').notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('setup'), // setup, inviting, bootcamp, completed
  setupCompleted: boolean('setup_completed').notNull().default(false),
  setupData: jsonb('setup_data').notNull().default({}), // Family profile data from wizard
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  communityIdx: index('onboarding_flows_community_idx').on(table.communityId),
  statusIdx: index('onboarding_flows_status_idx').on(table.status),
}));

// Progressive feature unlocks
export const featureUnlocks = pgTable('feature_unlocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  featureCode: varchar('feature_code', { length: 50 }).notNull(), // 'mini_games', 'skill_trees', 'labs', etc
  unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
  triggerType: varchar('trigger_type', { length: 50 }).notNull(), // 'time', 'task', 'achievement', 'manual'
  triggerData: jsonb('trigger_data').notNull().default({}), // Context about what triggered the unlock
}, (table) => ({
  userFeatureIdx: uniqueIndex('feature_unlocks_user_feature_idx').on(table.userId, table.featureCode),
  userIdx: index('feature_unlocks_user_idx').on(table.userId),
}));

// Onboarding tasks (special tasks for first week)
export const onboardingTasks = pgTable('onboarding_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(), // 'first_task', 'try_minigame', etc
  title: text('title').notNull(),
  description: text('description').notNull(),
  day: integer('day').notNull(), // Which bootcamp day this appears on (1-7)
  order: integer('order').notNull().default(0), // Order within the day
  category: varchar('category', { length: 50 }).notNull(), // 'tutorial', 'exploration', 'mastery'
  requirements: jsonb('requirements').notNull().default({}), // Prerequisites
  rewards: jsonb('rewards').notNull().default({}), // What completing this unlocks/gives
  isActive: boolean('is_active').notNull().default(true),
}, (table) => ({
  dayOrderIdx: index('onboarding_tasks_day_order_idx').on(table.day, table.order),
}));

// User's onboarding task progress
export const userOnboardingTasks = pgTable('user_onboarding_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => onboardingTasks.id),
  status: varchar('status', { length: 50 }).notNull().default('locked'), // locked, available, completed
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userTaskIdx: uniqueIndex('user_onboarding_tasks_user_task_idx').on(table.userId, table.taskId),
  userStatusIdx: index('user_onboarding_tasks_user_status_idx').on(table.userId, table.status),
}));

// Bootcamp milestones
export const bootcampMilestones = pgTable('bootcamp_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  day: integer('day').notNull(), // Which day this typically happens
  triggerType: varchar('trigger_type', { length: 50 }).notNull(), // 'task_count', 'points', 'time', etc
  triggerValue: integer('trigger_value').notNull(), // e.g., 5 tasks, 100 points
  rewards: jsonb('rewards').notNull().default({}),
  celebration: jsonb('celebration').notNull().default({}), // UI celebration config
});

// User bootcamp milestone progress
export const userBootcampMilestones = pgTable('user_bootcamp_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  milestoneId: uuid('milestone_id').notNull().references(() => bootcampMilestones.id),
  progress: integer('progress').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userMilestoneIdx: uniqueIndex('user_bootcamp_milestones_user_milestone_idx').on(table.userId, table.milestoneId),
}));

// Seasonal content definitions
export const seasonalContent = pgTable('seasonal_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'task', 'badge', 'lab_item', 'challenge'
  code: varchar('code', { length: 100 }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  data: jsonb('data').notNull().default({}), // Type-specific data
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
}, (table) => ({
  seasonTypeIdx: index('seasonal_content_season_type_idx').on(table.seasonId, table.type),
  seasonCodeIdx: uniqueIndex('seasonal_content_season_code_idx').on(table.seasonId, table.code),
}));

// User seasonal progress
export const userSeasonalProgress = pgTable('user_seasonal_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seasonId: uuid('season_id').notNull().references(() => seasons.id),
  contentId: uuid('content_id').notNull().references(() => seasonalContent.id),
  progress: jsonb('progress').notNull().default({}), // Content-specific progress
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userSeasonContentIdx: uniqueIndex('user_seasonal_progress_idx').on(table.userId, table.seasonId, table.contentId),
}));

// Community onboarding stats
export const communityOnboardingStats = pgTable('community_onboarding_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }).unique(),
  totalMembers: integer('total_members').notNull().default(0),
  activeMembers: integer('active_members').notNull().default(0),
  bootcampGraduates: integer('bootcamp_graduates').notNull().default(0),
  averageBootcampDays: integer('average_bootcamp_days').notNull().default(0),
  popularFeatures: jsonb('popular_features').notNull().default([]), // Most used features
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});
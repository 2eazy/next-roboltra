import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users, communities } from './users';

// Task category enum
export const taskCategoryV2Enum = pgEnum('task_category_v2', [
  'daily',
  'cleaning', 
  'homework',
  'cooking',
  'special'
]);

// Task type enum
export const taskTypeEnum = pgEnum('task_type', [
  'one_time',
  'recurring',
  'co_op'
]);

// New tasks table for task management system
export const tasksV2 = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // Using text instead of enum for flexibility
  type: text('type').notNull(), // 'one_time', 'recurring', 'co_op'
  baseReward: integer('base_reward').notNull(),
  staminaCost: integer('stamina_cost').notNull(),
  requiredRank: text('required_rank').notNull().default('R1'),
  requiredSkills: jsonb('required_skills').$type<string[]>(),
  
  // Scheduling
  expiresAt: timestamp('expires_at'),
  scheduledFor: timestamp('scheduled_for'),
  
  // Co-op settings
  coOpMinPlayers: integer('coop_min_players'),
  coOpMaxPlayers: integer('coop_max_players'),
  
  // Additional metadata
  tags: jsonb('tags').$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
  metadata: jsonb('metadata').default({}).$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
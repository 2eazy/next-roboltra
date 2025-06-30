import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { taskStatusEnum, taskCategoryEnum, skillTreeEnum, cooperationModeEnum } from './enums';
import { users, communities } from './users';

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  title: text('title').notNull(),
  description: text('description'),
  points: integer('points').notNull(),
  category: taskCategoryEnum('category').notNull(),
  skillTree: skillTreeEnum('skill_tree').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  staminaCost: integer('stamina_cost').notNull().default(10),
  
  // Cooperation
  cooperationMode: cooperationModeEnum('cooperation_mode'),
  maxParticipants: integer('max_participants').default(1),
  
  // Scheduling
  scheduledFor: timestamp('scheduled_for'),
  expiresAt: timestamp('expires_at'),
  recurringPattern: jsonb('recurring_pattern'), // { type: 'daily' | 'weekly' | 'monthly', days?: number[] }
  
  // Metadata
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const taskClaims = pgTable('task_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  claimedAt: timestamp('claimed_at').notNull().defaultNow(),
  staminaSpent: integer('stamina_spent').notNull(),
});

export const taskCompletions = pgTable('task_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  pointsEarned: integer('points_earned').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  verificationData: jsonb('verification_data'), // { type: 'self' | 'photo' | 'captain', photoUrl?: string }
  approvedBy: uuid('approved_by').references(() => users.id),
});
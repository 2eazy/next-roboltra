import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, varchar, index, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { reactionTypeEnum } from './enums';
import { users, communities } from './users';
import { tasks } from './tasks';

// Enhanced reactions system - can react to various entities
export const reactions = pgTable('reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'task', 'task_completion', 'badge', 'achievement', 'activity', 'lab_visit'
  targetId: uuid('target_id').notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(), // Store actual emoji character
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userTargetIdx: index('reactions_user_target_idx').on(table.userId, table.targetType, table.targetId),
  targetIdx: index('reactions_target_idx').on(table.targetType, table.targetId),
  communityIdx: index('reactions_community_idx').on(table.communityId),
  userTargetUnique: uniqueIndex('reactions_user_target_unique').on(table.userId, table.targetType, table.targetId),
}));

// Reaction summaries for fast counting
export const reactionSummaries = pgTable('reaction_summaries', {
  targetType: varchar('target_type', { length: 50 }).notNull(),
  targetId: uuid('target_id').notNull(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.targetType, table.targetId, table.emoji] }),
  communityIdx: index('reaction_summaries_community_idx').on(table.communityId),
}));

// Enhanced community activity feed
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'task_completed', 'badge_earned', 'level_up', 'streak_milestone', 'lab_upgrade', 'coop_completed'
  
  // Polymorphic reference
  entityType: varchar('entity_type', { length: 50 }), // 'task', 'badge', 'skill', 'lab', 'streak'
  entityId: uuid('entity_id'),
  
  // Activity data
  data: jsonb('data').notNull().default({}), // Type-specific data
  isPublic: boolean('is_public').notNull().default(true), // Can be seen by all community members
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  communityIdx: index('activities_community_idx').on(table.communityId),
  userIdx: index('activities_user_idx').on(table.userId),
  createdAtIdx: index('activities_created_at_idx').on(table.createdAt),
  typeIdx: index('activities_type_idx').on(table.type),
  publicIdx: index('activities_public_idx').on(table.isPublic),
}));

// Activity visibility control
export const activityVisibility = pgTable('activity_visibility', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hiddenAt: timestamp('hidden_at').defaultNow().notNull(),
}, (table) => ({
  activityUserIdx: uniqueIndex('activity_visibility_idx').on(table.activityId, table.userId),
}));

// Lab visits
export const labVisits = pgTable('lab_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  labOwnerId: uuid('lab_owner_id').notNull().references(() => users.id),
  visitorId: uuid('visitor_id').notNull().references(() => users.id),
  visitedAt: timestamp('visited_at').notNull().defaultNow(),
  duration: integer('duration'), // seconds spent in lab
});

// Community messages (from captains/commanders)
export const communityMessages = pgTable('community_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  priority: text('priority').notNull().default('normal'), // 'urgent', 'normal', 'info'
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Message read receipts
export const messageReads = pgTable('message_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => communityMessages.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  readAt: timestamp('read_at').notNull().defaultNow(),
});

// Enhanced co-op task participants
export const coopParticipants = pgTable('coop_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull().default('member'), // 'coordinator', 'member'
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'accepted', 'declined', 'completed'
  contribution: integer('contribution').notNull().default(0), // Percentage of work done
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  taskIdx: index('coop_participants_task_idx').on(table.taskId),
  userIdx: index('coop_participants_user_idx').on(table.userId),
  taskUserUnique: uniqueIndex('coop_participants_task_user_unique').on(table.taskId, table.userId),
}));

// Co-op task messages
export const coopTaskMessages = pgTable('coop_task_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: varchar('message', { length: 500 }).notNull(),
  metadata: jsonb('metadata').default({}), // For attachments, mentions, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  taskIdx: index('coop_messages_task_idx').on(table.taskId),
  createdAtIdx: index('coop_messages_created_at_idx').on(table.createdAt),
}));

// Co-op task progress milestones
export const coopTaskProgress = pgTable('coop_task_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  milestone: varchar('milestone', { length: 255 }).notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  taskIdx: index('coop_progress_task_idx').on(table.taskId),
  userIdx: index('coop_progress_user_idx').on(table.userId),
}));
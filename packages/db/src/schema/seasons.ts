import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users, communities } from './users';

// Seasons (monthly themes)
export const seasons = pgTable('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // e.g., 'spring_cleaning_2024'
  name: text('name').notNull(),
  description: text('description').notNull(),
  theme: text('theme').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  rewards: jsonb('rewards').notNull().default([]), // { type: string, value: any }[]
  specialBadges: jsonb('special_badges').notNull().default([]), // string[] of badge codes
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User progress in seasons
export const userSeasons = pgTable('user_seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  seasonId: uuid('season_id').notNull().references(() => seasons.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  progress: jsonb('progress').notNull().default({}), // Season-specific progress tracking
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
});

// Special events (time-limited challenges)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').references(() => communities.id), // null for global events
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'weekend_challenge', 'family_quest', 'territory_takeover'
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  requirements: jsonb('requirements').notNull().default({}), // Event-specific requirements
  rewards: jsonb('rewards').notNull().default({}), // Event-specific rewards
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event participation
export const eventParticipants = pgTable('event_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  score: integer('score').notNull().default(0),
  progress: jsonb('progress').notNull().default({}),
  completed: boolean('completed').notNull().default(false),
  rank: integer('rank'),
});

// Bootcamp progress (first week experience)
export const bootcampProgress = pgTable('bootcamp_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  day: integer('day').notNull().default(1),
  unlocks: jsonb('unlocks').notNull().default([]), // string[] of feature codes
  milestones: jsonb('milestones').notNull().default({}), // { milestone: timestamp }
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
});
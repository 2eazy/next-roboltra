import { pgTable, uuid, text, timestamp, integer, boolean, unique } from 'drizzle-orm/pg-core';
import { rankEnum, platformRoleEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  
  // Platform-level role (for system administration)
  platformRole: platformRoleEnum('platform_role').notNull().default('user'),
  
  // User preferences
  timezone: text('timezone').default('UTC'),
  locale: text('locale').default('en'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  inviteCode: text('invite_code').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  
  // Community settings
  isPublic: boolean('is_public').notNull().default(false),
  maxMembers: integer('max_members').notNull().default(10),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userCommunities = pgTable('user_communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  
  // Community-specific rank (R1-R5)
  rank: rankEnum('rank').notNull().default('R2'),
  isActive: boolean('is_active').notNull().default(true),
  
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  leftAt: timestamp('left_at'),
}, (table) => ({
  uniqueUserCommunity: unique().on(table.userId, table.communityId),
}));

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
});
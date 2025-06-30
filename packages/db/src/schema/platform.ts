import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

// Platform admin access logs
export const platformAccessLogs = pgTable('platform_access_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // 'login', 'view_community', 'edit_settings', etc.
  resource: text('resource'), // What was accessed
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Platform settings (singleton table)
export const platformSettings = pgTable('platform_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Support tickets for platform issues
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  communityId: uuid('community_id'), // Optional, if related to specific community
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'bug', 'feature', 'billing', 'other'
  priority: text('priority').notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved', 'closed'
  assignedTo: uuid('assigned_to').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Platform admin notes on communities/users
export const adminNotes = pgTable('admin_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // 'user', 'community'
  entityId: uuid('entity_id').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  note: text('note').notNull(),
  isInternal: boolean('is_internal').notNull().default(true), // Only visible to platform admins
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Platform-wide bans and restrictions
export const platformBans = pgTable('platform_bans', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // 'user', 'community', 'ip'
  entityId: text('entity_id').notNull(), // Can be UUID or IP address
  reason: text('reason').notNull(),
  bannedBy: uuid('banned_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at'), // null for permanent bans
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
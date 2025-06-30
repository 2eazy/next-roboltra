import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { users, communities } from './users';

// Global task templates (for admin to manage)
export const taskTemplates = pgTable('task_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  defaultPoints: integer('default_points').notNull(),
  category: text('category').notNull(),
  skillTree: text('skill_tree').notNull(),
  ageMin: integer('age_min').notNull().default(7),
  ageMax: integer('age_max'),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Subscriptions (payment tracking)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id).unique(),
  plan: text('plan').notNull(), // 'free', 'premium_3', 'premium_5', 'premium_10'
  status: text('status').notNull(), // 'active', 'cancelled', 'expired', 'past_due'
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAt: timestamp('cancel_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// System announcements
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // 'feature', 'maintenance', 'event', 'general'
  priority: text('priority').notNull().default('normal'), // 'urgent', 'high', 'normal', 'low'
  targetAudience: text('target_audience').notNull().default('all'), // 'all', 'free', 'premium'
  publishAt: timestamp('publish_at').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Feature flags
export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(false),
  rolloutPercentage: decimal('rollout_percentage', { precision: 5, scale: 2 }).default('0'),
  targetPlans: jsonb('target_plans').notNull().default([]), // ['free', 'premium_3', etc]
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Analytics events (privacy-preserving)
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(),
  communityId: uuid('community_id'), // Optional, for aggregated metrics
  properties: jsonb('properties').notNull().default({}),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Audit logs (for admin actions)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  changes: jsonb('changes').notNull().default({}),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
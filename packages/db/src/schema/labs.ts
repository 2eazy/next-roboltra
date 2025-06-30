import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { users, communities } from './users';

export const labItemCategoryEnum = pgEnum('lab_item_category', [
  'theme',
  'furniture',
  'decoration',
  'interactive',
  'floor',
  'wall',
  'special'
]);

export const labItemRarityEnum = pgEnum('lab_item_rarity', [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
]);

// Available lab items catalog
export const labItems = pgTable('lab_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: labItemCategoryEnum('category').notNull(),
  rarity: labItemRarityEnum('rarity').notNull().default('common'),
  
  // Visual properties
  iconUrl: varchar('icon_url', { length: 500 }).notNull(),
  modelUrl: varchar('model_url', { length: 500 }), // For 3D items
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  
  // Unlock requirements
  requiredLabLevel: integer('required_lab_level').notNull().default(1),
  pointsCost: integer('points_cost').notNull().default(0),
  seasonId: uuid('season_id'), // If seasonal item
  
  // Placement rules
  placementRules: jsonb('placement_rules').notNull().default('{}'), // e.g., { maxCount: 5, zones: ['floor', 'table'] }
  dimensions: jsonb('dimensions').notNull().default('{"width": 1, "height": 1, "depth": 1}'),
  
  // Interaction
  isInteractive: boolean('is_interactive').notNull().default(false),
  interactionData: jsonb('interaction_data'), // e.g., { type: 'sit', animation: 'sitting' }
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User's owned lab items
export const userLabItems = pgTable('user_lab_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  itemId: uuid('item_id').notNull().references(() => labItems.id),
  
  quantity: integer('quantity').notNull().default(1),
  acquiredAt: timestamp('acquired_at').notNull().defaultNow(),
  acquiredFrom: varchar('acquired_from', { length: 50 }).notNull(), // 'purchase', 'reward', 'achievement', 'season'
  
  // If placed in lab
  isPlaced: boolean('is_placed').notNull().default(false),
  placementData: jsonb('placement_data'), // { x: 0, y: 0, z: 0, rotation: 0 }
});

// Lab themes
export const labThemes = pgTable('lab_themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  
  // Visual assets
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).notNull(),
  floorTextureUrl: varchar('floor_texture_url', { length: 500 }).notNull(),
  wallTextureUrl: varchar('wall_texture_url', { length: 500 }).notNull(),
  lightingPreset: jsonb('lighting_preset').notNull().default('{}'),
  
  // Unlock requirements
  requiredLabLevel: integer('required_lab_level').notNull().default(1),
  pointsCost: integer('points_cost').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User's owned themes
export const userLabThemes = pgTable('user_lab_themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  themeId: uuid('theme_id').notNull().references(() => labThemes.id),
  
  unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(false),
});

// Lab visits tracking
export const labVisits = pgTable('lab_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  labOwnerId: uuid('lab_owner_id').notNull().references(() => users.id),
  visitorId: uuid('visitor_id').notNull().references(() => users.id),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  
  visitedAt: timestamp('visited_at').notNull().defaultNow(),
  duration: integer('duration'), // in seconds
  interactions: jsonb('interactions').notNull().default('[]'), // Array of interaction events
});

// Lab upgrade requirements
export const labUpgrades = pgTable('lab_upgrades', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromLevel: integer('from_level').notNull(),
  toLevel: integer('to_level').notNull(),
  
  pointsCost: integer('points_cost').notNull(),
  tasksRequired: integer('tasks_required').notNull(),
  itemsRequired: jsonb('items_required').notNull().default('[]'), // Array of { itemCode: string, quantity: number }
  
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  benefits: jsonb('benefits').notNull(), // Array of benefit descriptions
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type LabItem = typeof labItems.$inferSelect;
export type NewLabItem = typeof labItems.$inferInsert;
export type UserLabItem = typeof userLabItems.$inferSelect;
export type NewUserLabItem = typeof userLabItems.$inferInsert;
export type LabTheme = typeof labThemes.$inferSelect;
export type NewLabTheme = typeof labThemes.$inferInsert;
export type LabVisit = typeof labVisits.$inferSelect;
export type NewLabVisit = typeof labVisits.$inferInsert;
export type LabUpgrade = typeof labUpgrades.$inferSelect;

export interface LabLayout {
  rooms: Array<{
    id: string;
    type: 'main' | 'extension';
    position: { x: number; y: number; z: number };
    size: { width: number; height: number; depth: number };
  }>;
  placedItems: Array<{
    itemId: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    scale?: number;
  }>;
}

export interface PlacementRules {
  maxCount?: number;
  zones?: string[];
  requiresFloor?: boolean;
  stackable?: boolean;
  minSpacing?: number;
}
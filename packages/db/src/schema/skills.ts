import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users, communities } from './users';
import { skillTreeEnum } from './enums';

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  tree: skillTreeEnum('tree').notNull(),
  level: integer('level').notNull(), // 1-10
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  iconName: varchar('icon_name', { length: 255 }).notNull(),
  xpRequired: integer('xp_required').notNull(), // Cumulative XP needed to unlock
  
  // Perks/benefits when unlocked
  perks: jsonb('perks').notNull().default('[]'), // Array of perk objects
  
  // Visual position in tree (for UI rendering)
  position: jsonb('position').notNull().default('{"x": 0, "y": 0}'),
  
  // Dependencies
  parentSkillId: uuid('parent_skill_id').references(() => skills.id),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userSkills = pgTable('user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  skillId: uuid('skill_id').notNull().references(() => skills.id),
  
  currentXp: integer('current_xp').notNull().default(0),
  level: integer('level').notNull().default(0), // 0 = locked, 1-10 = unlocked levels
  unlockedAt: timestamp('unlocked_at'),
  
  // Track perk usage
  activePerks: jsonb('active_perks').notNull().default('[]'), // Array of active perk IDs
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Pre-defined skill tree perks that can be referenced
export const skillPerks = pgTable('skill_perks', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(), // e.g., 'culinary_speed_boost'
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'passive', 'active', 'modifier'
  
  // Effect configuration
  effect: jsonb('effect').notNull(), // e.g., { "type": "stamina_reduction", "value": 10 }
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Track XP gains for specific skill trees
export const skillXpGains = pgTable('skill_xp_gains', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  skillTree: skillTreeEnum('skill_tree').notNull(),
  
  xpAmount: integer('xp_amount').notNull(),
  source: varchar('source', { length: 50 }).notNull(), // 'task', 'bonus', 'achievement'
  sourceId: uuid('source_id'), // Reference to task, achievement, etc.
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
export type SkillPerk = typeof skillPerks.$inferSelect;
export type NewSkillPerk = typeof skillPerks.$inferInsert;
export type SkillXpGain = typeof skillXpGains.$inferSelect;
export type NewSkillXpGain = typeof skillXpGains.$inferInsert;

export type SkillTree = 'culinary' | 'domestic' | 'logistics' | 'maintenance' | 'habits';

export interface SkillPosition {
  x: number;
  y: number;
}

export interface PerkEffect {
  type: 'stamina_reduction' | 'point_multiplier' | 'xp_boost' | 'task_speed' | 'unlock_recipes';
  value: number;
  target?: string; // Optional target (e.g., specific task type)
}

export interface SkillPerkData {
  id: string;
  code: string;
  name: string;
  description: string;
  effect: PerkEffect;
}
import { pgEnum } from 'drizzle-orm/pg-core';

// Community member ranks
export const rankEnum = pgEnum('rank', ['R1', 'R2', 'R3', 'R4', 'R5']);

// Platform-level roles (separate from community roles)
export const platformRoleEnum = pgEnum('platform_role', ['super_admin', 'admin', 'support', 'user']);

export const taskStatusEnum = pgEnum('task_status', ['pending', 'claimed', 'completed', 'expired']);

export const taskCategoryEnum = pgEnum('task_category', ['quick_strike', 'standard', 'epic', 'legendary']);

export const skillTreeEnum = pgEnum('skill_tree', ['culinary', 'domestic', 'logistics', 'maintenance', 'habits']);

export const reactionTypeEnum = pgEnum('reaction_type', ['heart', 'clap', 'fire', 'cool', 'star']);

export const cooperationModeEnum = pgEnum('cooperation_mode', ['simultaneous', 'sequential', 'pooled']);
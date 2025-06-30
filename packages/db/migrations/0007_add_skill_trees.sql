-- Create skill tree enum
CREATE TYPE skill_tree AS ENUM ('culinary', 'domestic', 'logistics', 'maintenance', 'habits');

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree skill_tree NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(255) NOT NULL,
    xp_required INTEGER NOT NULL CHECK (xp_required >= 0),
    perks JSONB NOT NULL DEFAULT '[]',
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
    parent_skill_id UUID REFERENCES skills(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on skills
CREATE INDEX idx_skills_tree ON skills(tree);
CREATE INDEX idx_skills_parent ON skills(parent_skill_id);

-- User skills table
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 10),
    unlocked_at TIMESTAMP,
    active_perks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, community_id, skill_id)
);

-- Create indexes on user_skills
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_community ON user_skills(community_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);

-- Skill perks table
CREATE TABLE skill_perks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('passive', 'active', 'modifier')),
    effect JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on skill_perks
CREATE INDEX idx_skill_perks_code ON skill_perks(code);

-- Skill XP gains table
CREATE TABLE skill_xp_gains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    skill_tree skill_tree NOT NULL,
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    source VARCHAR(50) NOT NULL,
    source_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on skill_xp_gains
CREATE INDEX idx_skill_xp_gains_user ON skill_xp_gains(user_id);
CREATE INDEX idx_skill_xp_gains_community ON skill_xp_gains(community_id);
CREATE INDEX idx_skill_xp_gains_tree ON skill_xp_gains(skill_tree);
CREATE INDEX idx_skill_xp_gains_created ON skill_xp_gains(created_at);

-- Add skill tree to tasks for XP distribution
ALTER TABLE tasks ADD COLUMN skill_tree skill_tree;

-- Update tasks to set default skill trees based on category
UPDATE tasks SET skill_tree = 
    CASE 
        WHEN category = 'quick_strike' THEN 'habits'
        WHEN category = 'standard' THEN 'domestic'
        WHEN category = 'epic' THEN 'logistics'
        WHEN category = 'legendary' THEN 'maintenance'
        ELSE 'domestic'
    END
WHERE skill_tree IS NULL;

-- Make skill_tree required for new tasks
ALTER TABLE tasks ALTER COLUMN skill_tree SET NOT NULL;
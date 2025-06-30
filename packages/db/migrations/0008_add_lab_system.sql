-- Create lab item category enum
CREATE TYPE lab_item_category AS ENUM ('theme', 'furniture', 'decoration', 'interactive', 'floor', 'wall', 'special');

-- Create lab item rarity enum
CREATE TYPE lab_item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- Lab items catalog
CREATE TABLE lab_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category lab_item_category NOT NULL,
    rarity lab_item_rarity NOT NULL DEFAULT 'common',
    
    icon_url VARCHAR(500) NOT NULL,
    model_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    required_lab_level INTEGER NOT NULL DEFAULT 1 CHECK (required_lab_level >= 1 AND required_lab_level <= 4),
    points_cost INTEGER NOT NULL DEFAULT 0 CHECK (points_cost >= 0),
    season_id UUID,
    
    placement_rules JSONB NOT NULL DEFAULT '{}',
    dimensions JSONB NOT NULL DEFAULT '{"width": 1, "height": 1, "depth": 1}',
    
    is_interactive BOOLEAN NOT NULL DEFAULT false,
    interaction_data JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on lab_items
CREATE INDEX idx_lab_items_category ON lab_items(category);
CREATE INDEX idx_lab_items_rarity ON lab_items(rarity);
CREATE INDEX idx_lab_items_season ON lab_items(season_id);

-- User's owned lab items
CREATE TABLE user_lab_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES lab_items(id),
    
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    acquired_at TIMESTAMP NOT NULL DEFAULT NOW(),
    acquired_from VARCHAR(50) NOT NULL CHECK (acquired_from IN ('purchase', 'reward', 'achievement', 'season')),
    
    is_placed BOOLEAN NOT NULL DEFAULT false,
    placement_data JSONB,
    
    UNIQUE(user_id, item_id)
);

-- Create indexes on user_lab_items
CREATE INDEX idx_user_lab_items_user ON user_lab_items(user_id);
CREATE INDEX idx_user_lab_items_placed ON user_lab_items(user_id, is_placed);

-- Lab themes
CREATE TABLE lab_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    thumbnail_url VARCHAR(500) NOT NULL,
    floor_texture_url VARCHAR(500) NOT NULL,
    wall_texture_url VARCHAR(500) NOT NULL,
    lighting_preset JSONB NOT NULL DEFAULT '{}',
    
    required_lab_level INTEGER NOT NULL DEFAULT 1 CHECK (required_lab_level >= 1 AND required_lab_level <= 4),
    points_cost INTEGER NOT NULL DEFAULT 0 CHECK (points_cost >= 0),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User's owned themes
CREATE TABLE user_lab_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES lab_themes(id),
    
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(user_id, theme_id)
);

-- Create indexes on user_lab_themes
CREATE INDEX idx_user_lab_themes_user ON user_lab_themes(user_id);
CREATE INDEX idx_user_lab_themes_active ON user_lab_themes(user_id, is_active);

-- Lab visits tracking
CREATE TABLE lab_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    
    visited_at TIMESTAMP NOT NULL DEFAULT NOW(),
    duration INTEGER,
    interactions JSONB NOT NULL DEFAULT '[]'
);

-- Create indexes on lab_visits
CREATE INDEX idx_lab_visits_owner ON lab_visits(lab_owner_id);
CREATE INDEX idx_lab_visits_visitor ON lab_visits(visitor_id);
CREATE INDEX idx_lab_visits_community ON lab_visits(community_id);
CREATE INDEX idx_lab_visits_visited ON lab_visits(visited_at);

-- Lab upgrade requirements
CREATE TABLE lab_upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_level INTEGER NOT NULL CHECK (from_level >= 1 AND from_level < 4),
    to_level INTEGER NOT NULL CHECK (to_level > 1 AND to_level <= 4),
    
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    tasks_required INTEGER NOT NULL CHECK (tasks_required >= 0),
    items_required JSONB NOT NULL DEFAULT '[]',
    
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    benefits JSONB NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(from_level, to_level),
    CHECK(to_level = from_level + 1)
);
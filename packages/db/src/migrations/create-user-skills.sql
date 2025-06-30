-- Create user_skills table for tracking skill tree progression
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  skill_tree TEXT NOT NULL CHECK (skill_tree IN ('culinary', 'domestic', 'logistics', 'maintenance', 'habits')),
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_tree)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
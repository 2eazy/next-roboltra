-- Add missing columns to existing tables

-- Update users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en';

-- Update communities table
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS slug VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update slug for existing communities (generate from name)
UPDATE communities 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Generate invite codes for existing communities
UPDATE communities 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))
WHERE invite_code IS NULL;

-- Update tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS recurring_pattern VARCHAR(50),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add constraints
ALTER TABLE communities ALTER COLUMN slug SET NOT NULL;
ALTER TABLE communities ALTER COLUMN invite_code SET NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS communities_slug_idx ON communities(slug);
CREATE INDEX IF NOT EXISTS communities_invite_code_idx ON communities(invite_code);
CREATE INDEX IF NOT EXISTS communities_is_public_idx ON communities(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS tasks_expires_at_idx ON tasks(expires_at) WHERE expires_at IS NOT NULL;
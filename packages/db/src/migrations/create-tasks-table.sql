-- Drop existing tasks table and related tables
DROP TABLE IF EXISTS task_completions CASCADE;
DROP TABLE IF EXISTS task_claims CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Create tasks table for MVP
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('quick', 'standard', 'epic', 'legendary')),
  points INTEGER NOT NULL,
  stamina_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'completed')),
  created_by UUID NOT NULL REFERENCES users(id),
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_claimed_by ON tasks(claimed_by);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Create task_completions table for MVP
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  points_earned INTEGER NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Create task assignments table for managing task claims and completions

CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status task_assignment_status NOT NULL DEFAULT 'claimed',
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  completion_data JSONB DEFAULT '{}',
  approved_by_user_id UUID REFERENCES users(id),
  approval_notes TEXT,
  points_awarded INTEGER,
  coop_group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS task_assignments_task_idx ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS task_assignments_user_idx ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS task_assignments_status_idx ON task_assignments(status);
CREATE INDEX IF NOT EXISTS task_assignments_coop_group_idx ON task_assignments(coop_group_id) WHERE coop_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS task_assignments_claimed_at_idx ON task_assignments(claimed_at);

-- Ensure a user can only have one active assignment per task
CREATE UNIQUE INDEX IF NOT EXISTS task_assignments_task_user_active_unique 
ON task_assignments(task_id, user_id) 
WHERE status IN ('claimed', 'submitted');
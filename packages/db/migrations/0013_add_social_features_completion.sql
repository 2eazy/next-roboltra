-- Complete social features implementation

-- Reaction summaries for fast counting
CREATE TABLE IF NOT EXISTS reaction_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS reaction_summaries_target_emoji_unique 
ON reaction_summaries(target_type, target_id, emoji);

CREATE INDEX IF NOT EXISTS reaction_summaries_target_idx 
ON reaction_summaries(target_type, target_id);

-- Activity visibility preferences
CREATE TABLE IF NOT EXISTS activity_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS activity_visibility_idx 
ON activity_visibility(user_id, activity_id);

-- Co-op task messages
CREATE TABLE IF NOT EXISTS coop_task_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coop_task_messages_task_idx ON coop_task_messages(task_id);
CREATE INDEX IF NOT EXISTS coop_task_messages_created_idx ON coop_task_messages(created_at);

-- Co-op task progress milestones
CREATE TABLE IF NOT EXISTS coop_task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coop_task_progress_task_idx ON coop_task_progress(task_id);
CREATE INDEX IF NOT EXISTS coop_task_progress_user_idx ON coop_task_progress(user_id);

-- Add missing indexes to existing tables
CREATE INDEX IF NOT EXISTS reactions_user_target_idx ON reactions(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS reactions_target_idx ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS reactions_community_idx ON reactions(community_id);

CREATE UNIQUE INDEX IF NOT EXISTS reactions_user_target_unique 
ON reactions(user_id, target_type, target_id, emoji);

CREATE INDEX IF NOT EXISTS activities_community_idx ON activities(community_id);
CREATE INDEX IF NOT EXISTS activities_user_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS activities_type_idx ON activities(type);
CREATE INDEX IF NOT EXISTS activities_public_idx ON activities(is_public) WHERE is_public = true;
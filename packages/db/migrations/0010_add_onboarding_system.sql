-- Onboarding flow tracking
CREATE TABLE onboarding_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  captain_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'setup',
  setup_completed BOOLEAN NOT NULL DEFAULT false,
  setup_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX onboarding_flows_community_idx ON onboarding_flows(community_id);
CREATE INDEX onboarding_flows_status_idx ON onboarding_flows(status);

-- Progressive feature unlocks
CREATE TABLE feature_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_code VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  trigger_type VARCHAR(50) NOT NULL,
  trigger_data JSONB NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX feature_unlocks_user_feature_idx ON feature_unlocks(user_id, feature_code);
CREATE INDEX feature_unlocks_user_idx ON feature_unlocks(user_id);

-- Onboarding tasks (special tasks for first week)
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  day INTEGER NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  requirements JSONB NOT NULL DEFAULT '{}',
  rewards JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX onboarding_tasks_day_order_idx ON onboarding_tasks(day, "order");

-- User's onboarding task progress
CREATE TABLE user_onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES onboarding_tasks(id),
  status VARCHAR(50) NOT NULL DEFAULT 'locked',
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE UNIQUE INDEX user_onboarding_tasks_user_task_idx ON user_onboarding_tasks(user_id, task_id);
CREATE INDEX user_onboarding_tasks_user_status_idx ON user_onboarding_tasks(user_id, status);

-- Bootcamp milestones
CREATE TABLE bootcamp_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  day INTEGER NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_value INTEGER NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{}',
  celebration JSONB NOT NULL DEFAULT '{}'
);

-- User bootcamp milestone progress
CREATE TABLE user_bootcamp_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES bootcamp_milestones(id),
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP
);

CREATE UNIQUE INDEX user_bootcamp_milestones_user_milestone_idx ON user_bootcamp_milestones(user_id, milestone_id);

-- Seasonal content definitions
CREATE TABLE seasonal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  code VARCHAR(100) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX seasonal_content_season_type_idx ON seasonal_content(season_id, type);
CREATE UNIQUE INDEX seasonal_content_season_code_idx ON seasonal_content(season_id, code);

-- User seasonal progress
CREATE TABLE user_seasonal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id),
  content_id UUID NOT NULL REFERENCES seasonal_content(id),
  progress JSONB NOT NULL DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP
);

CREATE UNIQUE INDEX user_seasonal_progress_idx ON user_seasonal_progress(user_id, season_id, content_id);

-- Community onboarding stats
CREATE TABLE community_onboarding_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE UNIQUE,
  total_members INTEGER NOT NULL DEFAULT 0,
  active_members INTEGER NOT NULL DEFAULT 0,
  bootcamp_graduates INTEGER NOT NULL DEFAULT 0,
  average_bootcamp_days INTEGER NOT NULL DEFAULT 0,
  popular_features JSONB NOT NULL DEFAULT '[]',
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);
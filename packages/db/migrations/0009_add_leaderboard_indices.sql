-- Add additional indices for leaderboard performance
CREATE INDEX idx_leaderboard_entries_period ON leaderboard_entries(period, period_start, category);
CREATE INDEX idx_leaderboard_entries_community_period ON leaderboard_entries(community_id, period, period_start);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(community_id, period, category, rank);
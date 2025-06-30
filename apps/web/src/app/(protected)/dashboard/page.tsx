import { auth } from "@/lib/auth";
import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";
import { gameEngine } from "@roboltra/game-engine";
import { getAvailableTasks } from "@/lib/actions/tasks";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskList } from "@/components/dashboard/task-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { LeaderboardPreview } from "@/components/dashboard/leaderboard-preview";
import { RecentBadges } from "@/components/dashboard/recent-badges";

async function getDashboardData(userId: string) {
  // Get comprehensive user stats from game engine
  const gameStats = await gameEngine.getUserStats(userId);
  
  // Get user stats from database for additional info
  const statsQuery = sql`
    SELECT * FROM user_stats
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  
  const statsResult = await db.execute(statsQuery);
  const dbStats = statsResult.rows[0] || {
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
  };

  // Combine stats
  const stats = {
    total_points: Number(dbStats.total_points) || 0,
    current_streak: Number(dbStats.current_streak) || 0,
    current_stamina: gameStats.stamina.current,
    max_stamina: gameStats.stamina.max,
    level: gameStats.level.currentLevel,
    current_xp: gameStats.level.currentXP,
    xp_for_next_level: gameStats.level.xpForNextLevel,
    progress_percentage: gameStats.level.progressPercentage,
    points_today: gameStats.pointsToday,
  };

  // Get available tasks
  const availableTasks = await getAvailableTasks();

  return {
    stats,
    availableTasks,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { stats, availableTasks } = await getDashboardData(session.user.id);
  
  // Filter to show only truly available tasks (not claimed by others)
  const myAvailableTasks = availableTasks.filter(
    task => task.status === "available" || task.claimed_by === session.user.id
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {session.user.name || "Robo"}!
        </h1>
        
        <StatsCards stats={stats} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Available Tasks</h2>
            <TaskList tasks={myAvailableTasks} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Family Activity</h2>
            <ActivityFeed />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Leaders</h3>
            <LeaderboardPreview />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Badges</h3>
            <RecentBadges />
          </div>
        </aside>
      </div>
    </div>
  );
}
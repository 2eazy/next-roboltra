import { auth } from "@/lib/auth";
import { db } from "@roboltra/db";
import { users, userStats } from "@roboltra/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskList } from "@/components/dashboard/task-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { LeaderboardPreview } from "@/components/dashboard/leaderboard-preview";
import { RecentBadges } from "@/components/dashboard/recent-badges";

async function getDashboardData(userId: string) {
  // Get user stats
  const statsQuery = sql`
    SELECT * FROM user_stats
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  
  const statsResult = await db.execute(statsQuery);
  const stats = statsResult.rows[0] || {
    total_points: 0,
    current_streak: 0,
    current_stamina: 100,
    max_stamina: 100,
    level: 1,
  };

  // Get available tasks - for MVP, we'll return mock data
  const availableTasks = [
    {
      id: "1",
      title: "Clean the kitchen",
      description: "Wipe down counters and do dishes",
      points: 20,
      category: "standard",
      stamina_cost: 10,
    },
    {
      id: "2",
      title: "Take out trash",
      description: "Empty all bins and replace bags",
      points: 10,
      category: "quick",
      stamina_cost: 5,
    },
  ];

  return {
    stats,
    availableTasks,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { stats, availableTasks } = await getDashboardData(session.user.id);

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
            <TaskList tasks={availableTasks} />
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
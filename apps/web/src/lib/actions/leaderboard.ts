"use server";

import { auth } from "@/lib/auth";
import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all-time";
export type LeaderboardCategory = "points" | "tasks" | "streak" | "level";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  value: number;
  isCurrentUser: boolean;
  trend?: "up" | "down" | "same";
}

export async function getLeaderboard(
  period: LeaderboardPeriod = "weekly",
  category: LeaderboardCategory = "points"
): Promise<LeaderboardEntry[]> {
  const session = await auth();
  if (!session?.user) return [];

  let valueColumn = "";
  let orderBy = "";
  let dateFilter = "";

  // Determine date filter based on period
  const now = new Date();
  switch (period) {
    case "daily":
      dateFilter = "AND DATE(tc.completed_at) = CURRENT_DATE";
      break;
    case "weekly":
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = `AND tc.completed_at >= '${weekAgo.toISOString()}'`;
      break;
    case "monthly":
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = `AND tc.completed_at >= '${monthAgo.toISOString()}'`;
      break;
    case "all-time":
      dateFilter = "";
      break;
  }

  // Build query based on category
  let query;
  switch (category) {
    case "points":
      if (period === "all-time") {
        query = sql`
          SELECT 
            u.id as user_id,
            u.name as user_name,
            COALESCE(us.total_points, 0) as value
          FROM users u
          LEFT JOIN user_stats us ON u.id = us.user_id
          ORDER BY value DESC
          LIMIT 50
        `;
      } else {
        query = sql`
          SELECT 
            u.id as user_id,
            u.name as user_name,
            COALESCE(SUM(tc.points_earned), 0) as value
          FROM users u
          LEFT JOIN task_completions tc ON u.id = tc.user_id ${sql.raw(dateFilter)}
          GROUP BY u.id, u.name
          ORDER BY value DESC
          LIMIT 50
        `;
      }
      break;

    case "tasks":
      query = sql`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COUNT(tc.id) as value
        FROM users u
        LEFT JOIN task_completions tc ON u.id = tc.user_id ${sql.raw(dateFilter)}
        GROUP BY u.id, u.name
        ORDER BY value DESC
        LIMIT 50
      `;
      break;

    case "streak":
      query = sql`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COALESCE(us.current_streak, 0) as value
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        ORDER BY value DESC
        LIMIT 50
      `;
      break;

    case "level":
      query = sql`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COALESCE(us.level, 1) as value
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        ORDER BY value DESC, us.total_xp DESC
        LIMIT 50
      `;
      break;

    default:
      return [];
  }

  const result = await db.execute(query);
  
  // Add rank and current user flag
  const entries: LeaderboardEntry[] = result.rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id as string,
    userName: row.user_name as string,
    value: Number(row.value) || 0,
    isCurrentUser: row.user_id === session.user.id,
  }));

  // Filter to show only users with activity
  return entries.filter(entry => entry.value > 0);
}
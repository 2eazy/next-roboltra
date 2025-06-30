"use client";

import { useState, useEffect } from "react";
import { getLeaderboard, type LeaderboardPeriod, type LeaderboardCategory, type LeaderboardEntry } from "@/lib/actions/leaderboard";
import { cn } from "@/lib/utils";

export function LeaderboardView() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [category, setCategory] = useState<LeaderboardCategory>("points");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(period, category);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const periods: { value: LeaderboardPeriod; label: string }[] = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
    { value: "all-time", label: "All Time" },
  ];

  const categories: { value: LeaderboardCategory; label: string; icon: string }[] = [
    { value: "points", label: "Points", icon: "⭐" },
    { value: "tasks", label: "Tasks", icon: "✅" },
    { value: "streak", label: "Streak", icon: "🔥" },
    { value: "level", label: "Level", icon: "📈" },
  ];

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: "🥇", color: "text-yellow-600" };
      case 2:
        return { icon: "🥈", color: "text-gray-500" };
      case 3:
        return { icon: "🥉", color: "text-orange-600" };
      default:
        return { icon: rank.toString(), color: "text-gray-600" };
    }
  };

  const getValueDisplay = (value: number, category: LeaderboardCategory) => {
    switch (category) {
      case "points":
        return `${value.toLocaleString()} pts`;
      case "tasks":
        return `${value} ${value === 1 ? "task" : "tasks"}`;
      case "streak":
        return `${value} ${value === 1 ? "day" : "days"}`;
      case "level":
        return `Level ${value}`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              period === p.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              category === c.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-sm font-medium">{c.label}</div>
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading leaderboard...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No data available for this period.
          </div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => {
              const rankDisplay = getRankDisplay(entry.rank);
              return (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-gray-50",
                    entry.isCurrentUser && "bg-blue-50 hover:bg-blue-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("text-2xl font-bold w-10 text-center", rankDisplay.color)}>
                      {rankDisplay.icon}
                    </div>
                    <div>
                      <div className="font-medium">
                        {entry.userName}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-sm text-blue-600">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {getValueDisplay(entry.value, category)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats summary */}
      {!loading && entries.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            {entries.find(e => e.isCurrentUser) ? (
              <div>
                Your rank: <span className="font-semibold">
                  #{entries.find(e => e.isCurrentUser)?.rank}
                </span> out of {entries.length} active members
              </div>
            ) : (
              <div>You haven't earned any {category} yet this period.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
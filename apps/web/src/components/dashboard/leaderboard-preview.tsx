"use client";

import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  trend: "up" | "down" | "same";
}

export function LeaderboardPreview() {
  const leaders: LeaderboardEntry[] = [
    { rank: 1, name: "Alex", points: 245, trend: "same" },
    { rank: 2, name: "Sam", points: 220, trend: "up" },
    { rank: 3, name: "Jordan", points: 195, trend: "down" },
    { rank: 4, name: "You", points: 180, trend: "up" },
    { rank: 5, name: "Casey", points: 175, trend: "same" },
  ];

  const getTrendIcon = (trend: LeaderboardEntry["trend"]) => {
    switch (trend) {
      case "up":
        return <span className="text-green-500">↑</span>;
      case "down":
        return <span className="text-red-500">↓</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <div
            key={leader.rank}
            className={`flex items-center justify-between py-2 px-3 rounded ${
              leader.name === "You" ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-bold text-gray-500 w-6">{leader.rank}</span>
              <span className={leader.name === "You" ? "font-semibold" : ""}>
                {leader.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{leader.points}</span>
              {getTrendIcon(leader.trend)}
            </div>
          </div>
        ))}
      </div>
      
      <Link
        href="/leaderboard"
        className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700"
      >
        View full leaderboard →
      </Link>
    </div>
  );
}
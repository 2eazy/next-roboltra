"use client";

import Link from "next/link";

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedBy: string;
  earnedAt: Date;
}

export function RecentBadges() {
  const recentBadges: Badge[] = [
    {
      id: "1",
      name: "Early Bird",
      icon: "🌅",
      earnedBy: "Sam",
      earnedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Task Master",
      icon: "⚡",
      earnedBy: "Alex",
      earnedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Team Player",
      icon: "🤝",
      earnedBy: "Jordan",
      earnedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ];

  return (
    <div>
      <div className="space-y-3">
        {recentBadges.map((badge) => (
          <div key={badge.id} className="flex items-center space-x-3">
            <div className="text-2xl">{badge.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{badge.name}</p>
              <p className="text-xs text-gray-500">
                Earned by {badge.earnedBy}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/badges"
        className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700"
      >
        View all badges →
      </Link>
    </div>
  );
}
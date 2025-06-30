"use client";

import { useEffect, useState } from "react";

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  points?: number;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      user: "Alex",
      action: "completed task 'Clean the kitchen'",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      points: 20,
    },
    {
      id: "2", 
      user: "Sam",
      action: "unlocked the 'Early Bird' badge",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      user: "Jordan",
      action: "reached level 5",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
            {activity.user[0]}
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span>{" "}
              {activity.action}
              {activity.points && (
                <span className="text-green-600 font-medium ml-1">
                  +{activity.points}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatTimestamp(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
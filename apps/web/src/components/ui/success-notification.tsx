"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface SuccessNotificationProps {
  show: boolean;
  points: {
    base: number;
    streakBonus: number;
    total: number;
  };
  streak?: number;
  leveledUp?: boolean;
  newLevel?: number;
  onClose: () => void;
}

export function SuccessNotification({
  show,
  points,
  streak,
  leveledUp,
  newLevel,
  onClose,
}: SuccessNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4 min-w-[300px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-800">
              Task Completed! 🎉
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Points:</span>
              <span className="font-medium">+{points.base}</span>
            </div>
            
            {points.streakBonus > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Streak Bonus:</span>
                <span className="font-medium">+{points.streakBonus}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total Points:</span>
              <span className="font-bold text-lg">+{points.total}</span>
            </div>
          </div>

          {streak && streak > 0 && (
            <div className="text-sm text-gray-600">
              🔥 {streak} day streak!
            </div>
          )}

          {leveledUp && newLevel && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md p-3 text-center">
              <div className="font-bold">LEVEL UP!</div>
              <div className="text-sm">You're now level {newLevel}!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
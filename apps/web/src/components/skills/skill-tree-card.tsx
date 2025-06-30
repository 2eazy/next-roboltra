"use client";

import { cn } from "@/lib/utils";

interface SkillTreeCardProps {
  skillTree: string;
  info: {
    name: string;
    icon: string;
    description: string;
    color: string;
  };
  progress: {
    level: number;
    xp: number;
    progressPercentage: number;
  };
}

export function SkillTreeCard({ skillTree, info, progress }: SkillTreeCardProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      orange: {
        bg: "bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-800",
        progress: "bg-orange-500",
      },
      blue: {
        bg: "bg-blue-100",
        border: "border-blue-200",
        text: "text-blue-800",
        progress: "bg-blue-500",
      },
      purple: {
        bg: "bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-800",
        progress: "bg-purple-500",
      },
      gray: {
        bg: "bg-gray-100",
        border: "border-gray-200",
        text: "text-gray-800",
        progress: "bg-gray-500",
      },
      green: {
        bg: "bg-green-100",
        border: "border-green-200",
        text: "text-green-800",
        progress: "bg-green-500",
      },
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const colorClasses = getColorClasses(info.color);
  const currentLevelXP = progress.xp % 1000;
  const isMaxLevel = progress.level >= 10;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{info.icon}</span>
            <h3 className="text-lg font-semibold">{info.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{info.description}</p>
        </div>
        <div className={cn("text-2xl font-bold", colorClasses.text)}>
          {progress.level}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Level {progress.level}</span>
            <span className="text-gray-600">
              {isMaxLevel ? "MAX" : `${currentLevelXP}/1000 XP`}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                colorClasses.progress
              )}
              style={{ width: `${isMaxLevel ? 100 : progress.progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <div>Total XP: {progress.xp.toLocaleString()}</div>
          {!isMaxLevel && (
            <div>Next level in: {1000 - currentLevelXP} XP</div>
          )}
        </div>

        {progress.level > 0 && (
          <div className={cn("rounded-lg p-3", colorClasses.bg, colorClasses.border)}>
            <div className="text-xs font-medium mb-1">Unlocked Perks:</div>
            <div className="text-xs space-y-0.5">
              {progress.level >= 3 && <div>• Level 3: Basic proficiency</div>}
              {progress.level >= 5 && <div>• Level 5: Intermediate skills</div>}
              {progress.level >= 7 && <div>• Level 7: Advanced techniques</div>}
              {progress.level >= 10 && <div>• Level 10: Master status!</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
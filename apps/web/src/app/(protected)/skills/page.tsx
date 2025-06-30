import { auth } from "@/lib/auth";
import { gameEngine } from "@roboltra/game-engine";
import { SkillTreeCard } from "@/components/skills/skill-tree-card";

const skillTreeInfo = {
  culinary: {
    name: "Culinary Arts",
    icon: "🍳",
    description: "Master the art of cooking and kitchen management",
    color: "orange",
  },
  domestic: {
    name: "Domestic Mastery",
    icon: "🏠",
    description: "Excel at household organization and cleanliness",
    color: "blue",
  },
  logistics: {
    name: "Logistics Expert",
    icon: "📦",
    description: "Optimize planning, scheduling, and resource management",
    color: "purple",
  },
  maintenance: {
    name: "Maintenance Pro",
    icon: "🔧",
    description: "Keep everything running smoothly with repairs and upkeep",
    color: "gray",
  },
  habits: {
    name: "Habit Builder",
    icon: "✨",
    description: "Develop consistent positive behaviors and routines",
    color: "green",
  },
};

export default async function SkillsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userStats = await gameEngine.getUserStats(session.user.id);
  const skillProgress = userStats.skills;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Skill Trees</h1>
        <p className="text-gray-600">
          Develop your skills across different areas. Complete tasks to earn XP!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(skillTreeInfo).map(([key, info]) => {
          const progress = skillProgress[key as keyof typeof skillProgress];
          return (
            <SkillTreeCard
              key={key}
              skillTree={key}
              info={info}
              progress={progress}
            />
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Complete tasks to earn XP in specific skill trees</li>
          <li>• Each skill tree has 10 levels with 1,000 XP per level</li>
          <li>• Quick tasks → Habits, Standard → Domestic, Epic → Logistics, Legendary → Maintenance</li>
          <li>• Higher levels unlock special perks and badges (coming soon!)</li>
        </ul>
      </div>
    </div>
  );
}
"use client";

interface StatsCardsProps {
  stats: {
    total_points?: number;
    current_streak?: number;
    current_stamina?: number;
    max_stamina?: number;
    level?: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const staminaPercentage = ((stats.current_stamina || 100) / (stats.max_stamina || 100)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Stats</h3>
        <p className="text-2xl font-bold text-gray-900">Level {stats.level || 1}</p>
        <p className="text-sm text-gray-600 mt-1">{stats.total_points || 0} points</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Current Streak</h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900">{stats.current_streak || 0}</span>
          {(stats.current_streak || 0) > 0 && (
            <span className="ml-2 text-2xl">🔥</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">days</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Stamina</h3>
        <p className="text-2xl font-bold text-gray-900">
          {stats.current_stamina || 100}/{stats.max_stamina || 100}
        </p>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
            style={{ width: `${staminaPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
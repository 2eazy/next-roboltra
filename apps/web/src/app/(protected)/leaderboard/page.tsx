import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-600">
          See how you rank against other family members!
        </p>
      </div>

      <LeaderboardView />
    </div>
  );
}
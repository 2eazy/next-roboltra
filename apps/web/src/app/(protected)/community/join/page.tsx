"use client";

import { useState } from "react";
import { joinCommunity } from "@/lib/actions/communities";
import { useRouter } from "next/navigation";

export default function JoinCommunityPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const community = await joinCommunity(inviteCode);
      router.push(`/community/${community.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Join a Community</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium mb-2">
              Invite Code
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              placeholder="Enter 8-character code"
              maxLength={8}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl font-mono uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ask your family member for their community invite code
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Ready to join?</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• You'll start as a Recruit (R1)</li>
              <li>• Complete tasks to rank up and unlock features</li>
              <li>• Compete with family members on the leaderboard</li>
              <li>• Collaborate on family tasks and goals</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || inviteCode.length !== 8}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Joining..." : "Join Community"}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an invite code?{" "}
          <button
            onClick={() => router.push("/community/create")}
            className="text-blue-600 hover:text-blue-700"
          >
            Create your own community
          </button>
        </p>
      </div>
    </div>
  );
}
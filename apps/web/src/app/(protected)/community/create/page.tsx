import { createCommunity } from "@/lib/actions/communities";

export default function CreateCommunityPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a Community</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form action={createCommunity} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Community Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., The Smith Family"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how your community will be identified
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What's special about your community?"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll become the Captain (R5) of this community</li>
              <li>• You'll get a unique invite code to share with family members</li>
              <li>• Members can create and share tasks within the community</li>
              <li>• Everyone competes on the same leaderboard</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Community
          </button>
        </form>
      </div>
    </div>
  );
}
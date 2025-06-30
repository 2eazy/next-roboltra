import { auth } from "@/lib/auth";
import { db } from "@roboltra/db";
import { communities, userCommunities, users } from "@roboltra/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function CommunityPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  if (!session?.user) return notFound();

  // Get community details
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.slug, params.slug));

  if (!community) return notFound();

  // Check if user is a member
  const [membership] = await db
    .select()
    .from(userCommunities)
    .where(
      and(
        eq(userCommunities.userId, session.user.id),
        eq(userCommunities.communityId, community.id),
        eq(userCommunities.isActive, true)
      )
    );

  if (!membership) return notFound();

  // Get community members
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      rank: userCommunities.rank,
      joinedAt: userCommunities.joinedAt,
    })
    .from(userCommunities)
    .innerJoin(users, eq(userCommunities.userId, users.id))
    .where(
      and(
        eq(userCommunities.communityId, community.id),
        eq(userCommunities.isActive, true)
      )
    )
    .orderBy(userCommunities.joinedAt);

  const getRankDisplay = (rank: string) => {
    const ranks = {
      R1: { name: "Recruit", icon: "🌱" },
      R2: { name: "Contributor", icon: "⭐" },
      R3: { name: "Veteran", icon: "🎖️" },
      R4: { name: "Commander", icon: "🎯" },
      R5: { name: "Captain", icon: "👑" },
    };
    return ranks[rank as keyof typeof ranks] || { name: rank, icon: "🔸" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
            {community.description && (
              <p className="text-gray-600">{community.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Invite Code</p>
            <p className="text-2xl font-mono font-bold text-blue-600">
              {community.inviteCode}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Members</div>
            <div className="text-2xl font-bold">{members.length}</div>
            <div className="text-xs text-gray-500">of {community.maxMembers} max</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Your Rank</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRankDisplay(membership.rank).icon}</span>
              <span className="font-bold">{getRankDisplay(membership.rank).name}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Created</div>
            <div className="font-medium">
              {new Date(community.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <div className="space-y-3">
          {members.map((member) => {
            const rank = getRankDisplay(member.rank);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium">
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="font-medium">
                      {member.name}
                      {member.id === session.user.id && (
                        <span className="text-sm text-gray-500 ml-2">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rank.icon}</span>
                  <span className="text-sm font-medium">{rank.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Invite Family Members</h3>
        <p className="text-sm text-blue-800">
          Share the invite code <span className="font-mono font-bold">{community.inviteCode}</span> with
          family members so they can join your community and start earning points together!
        </p>
      </div>
    </div>
  );
}
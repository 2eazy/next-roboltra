"use server";

import { auth } from "@/lib/auth";
import { db } from "@roboltra/db";
import { communities, userCommunities } from "@roboltra/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";

export interface Community {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  description?: string;
  imageUrl?: string;
  memberCount?: number;
  isActive?: boolean;
  userRank?: string;
}

/**
 * Create a new community
 */
export async function createCommunity(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    throw new Error("Community name is required");
  }

  // Generate unique slug and invite code
  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(6);
  const inviteCode = nanoid(8).toUpperCase();

  // Create community
  const [community] = await db
    .insert(communities)
    .values({
      name,
      slug,
      inviteCode,
      description,
    })
    .returning();

  // Add creator as R5 (Captain) member
  await db.insert(userCommunities).values({
    userId: session.user.id,
    communityId: community.id,
    rank: "R5",
  });

  // Set this as the user's active community
  await setActiveCommunity(community.id);

  redirect(`/community/${community.slug}`);
}

/**
 * Join a community using invite code
 */
export async function joinCommunity(inviteCode: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Find community by invite code
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.inviteCode, inviteCode.toUpperCase()));

  if (!community) {
    throw new Error("Invalid invite code");
  }

  // Check if already a member
  const [existing] = await db
    .select()
    .from(userCommunities)
    .where(
      and(
        eq(userCommunities.userId, session.user.id),
        eq(userCommunities.communityId, community.id)
      )
    );

  if (existing) {
    throw new Error("You are already a member of this community");
  }

  // Check member limit
  const memberCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(userCommunities)
    .where(eq(userCommunities.communityId, community.id));

  if (memberCount[0].count >= (community.maxMembers || 10)) {
    throw new Error("This community is full");
  }

  // Add user to community as R1 (Recruit)
  await db.insert(userCommunities).values({
    userId: session.user.id,
    communityId: community.id,
    rank: "R1",
  });

  // Set as active community
  await setActiveCommunity(community.id);

  return community;
}

/**
 * Get user's communities
 */
export async function getUserCommunities(): Promise<Community[]> {
  const session = await auth();
  if (!session?.user) return [];

  const query = sql`
    SELECT 
      c.*,
      uc.rank as user_rank,
      COUNT(uc2.id) as member_count
    FROM communities c
    INNER JOIN user_communities uc ON c.id = uc.community_id
    LEFT JOIN user_communities uc2 ON c.id = uc2.community_id
    WHERE uc.user_id = ${session.user.id}
      AND uc.is_active = true
    GROUP BY c.id, uc.rank
    ORDER BY uc.joined_at DESC
  `;

  const result = await db.execute(query);
  
  return result.rows.map(row => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    inviteCode: row.invite_code as string,
    description: row.description as string | undefined,
    imageUrl: row.image_url as string | undefined,
    memberCount: Number(row.member_count),
    userRank: row.user_rank as string,
  }));
}

/**
 * Get current active community
 */
export async function getActiveCommunity(): Promise<Community | null> {
  const session = await auth();
  if (!session?.user) return null;

  // For MVP, we'll use the first community
  // In a full implementation, we'd store the active community in user session
  const communities = await getUserCommunities();
  return communities[0] || null;
}

/**
 * Set active community (for switching between communities)
 */
export async function setActiveCommunity(communityId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify user is member of this community
  const [membership] = await db
    .select()
    .from(userCommunities)
    .where(
      and(
        eq(userCommunities.userId, session.user.id),
        eq(userCommunities.communityId, communityId),
        eq(userCommunities.isActive, true)
      )
    );

  if (!membership) {
    throw new Error("You are not a member of this community");
  }

  // In a full implementation, we'd update the user's session
  // For now, we'll rely on getting the first community
  revalidatePath("/");
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(userCommunities)
    .set({
      isActive: false,
      leftAt: new Date(),
    })
    .where(
      and(
        eq(userCommunities.userId, session.user.id),
        eq(userCommunities.communityId, communityId)
      )
    );

  revalidatePath("/");
}
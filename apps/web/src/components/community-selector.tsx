"use client";

import { useState, useEffect } from "react";
import { getUserCommunities, setActiveCommunity, type Community } from "@/lib/actions/communities";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CommunitySelectorProps {
  currentCommunity: Community | null;
}

export function CommunitySelector({ currentCommunity }: CommunitySelectorProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const data = await getUserCommunities();
      setCommunities(data);
    } catch (error) {
      console.error("Failed to load communities:", error);
    }
  };

  const handleSwitch = async (communityId: string) => {
    if (communityId === currentCommunity?.id) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await setActiveCommunity(communityId);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to switch community:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentCommunity && communities.length === 0) {
    return (
      <button
        onClick={() => router.push("/community/create")}
        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
      >
        Create Community
      </button>
    );
  }

  if (!currentCommunity) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium",
          "bg-gray-100 hover:bg-gray-200 transition-colors"
        )}
      >
        <span className="text-lg">👥</span>
        <span>{currentCommunity.name}</span>
        <svg
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Your Communities
              </div>
              
              {communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => handleSwitch(community.id)}
                  disabled={loading}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100",
                    "flex items-center justify-between",
                    community.id === currentCommunity.id && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div>
                    <div className="font-medium">{community.name}</div>
                    <div className="text-xs text-gray-500">
                      {community.memberCount} members • {community.userRank}
                    </div>
                  </div>
                  {community.id === currentCommunity.id && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              ))}
              
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/community/create");
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 text-blue-600"
                >
                  + Create New Community
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/community/join");
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 text-green-600"
                >
                  🎟️ Join with Invite Code
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
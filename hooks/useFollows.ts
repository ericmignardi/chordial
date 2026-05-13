import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export type FollowUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type FollowCounts = {
  followers: number;
  following: number;
  is_following: boolean;
};

export function useFollowCounts(userId: string | undefined) {
  const { session } = useAuth();
  const viewerId = session?.user.id;

  return useQuery({
    queryKey: ["follow-counts", userId, viewerId],
    enabled: !!userId,
    queryFn: async (): Promise<FollowCounts> => {
      if (!userId) return { followers: 0, following: 0, is_following: false };

      const [followers, following, mine] = await Promise.all([
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("followee_id", userId),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId),
        viewerId && viewerId !== userId
          ? supabase
              .from("follows")
              .select("follower_id")
              .eq("follower_id", viewerId)
              .eq("followee_id", userId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null } as const),
      ]);

      if (followers.error) throw followers.error;
      if (following.error) throw following.error;
      if ("error" in mine && mine.error) throw mine.error;

      return {
        followers: followers.count ?? 0,
        following: following.count ?? 0,
        is_following: !!(mine as { data: unknown }).data,
      };
    },
  });
}

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ["followers", userId],
    enabled: !!userId,
    queryFn: async (): Promise<FollowUser[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("follows")
        .select(
          "follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)",
        )
        .eq("followee_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as {
        follower: FollowUser | FollowUser[] | null;
      }[];
      return rows
        .map((row) => (Array.isArray(row.follower) ? row.follower[0] ?? null : row.follower))
        .filter((u): u is FollowUser => !!u);
    },
  });
}

export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ["following", userId],
    enabled: !!userId,
    queryFn: async (): Promise<FollowUser[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("follows")
        .select(
          "followee:profiles!follows_followee_id_fkey(id, username, display_name, avatar_url)",
        )
        .eq("follower_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as {
        followee: FollowUser | FollowUser[] | null;
      }[];
      return rows
        .map((row) => (Array.isArray(row.followee) ? row.followee[0] ?? null : row.followee))
        .filter((u): u is FollowUser => !!u);
    },
  });
}

export function useFollow(targetUserId: string | undefined) {
  const { session } = useAuth();
  const viewerId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!viewerId) throw new Error("Not signed in");
      if (!targetUserId) throw new Error("Missing target user");
      if (viewerId === targetUserId)
        throw new Error("Cannot follow yourself");
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: viewerId, followee_id: targetUserId });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-counts", targetUserId] });
      qc.invalidateQueries({ queryKey: ["follow-counts", viewerId] });
      qc.invalidateQueries({ queryKey: ["followers", targetUserId] });
      qc.invalidateQueries({ queryKey: ["following", viewerId] });
      qc.invalidateQueries({ queryKey: ["feed", "home"] });
    },
  });
}

export function useUnfollow(targetUserId: string | undefined) {
  const { session } = useAuth();
  const viewerId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!viewerId) throw new Error("Not signed in");
      if (!targetUserId) throw new Error("Missing target user");
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", viewerId)
        .eq("followee_id", targetUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-counts", targetUserId] });
      qc.invalidateQueries({ queryKey: ["follow-counts", viewerId] });
      qc.invalidateQueries({ queryKey: ["followers", targetUserId] });
      qc.invalidateQueries({ queryKey: ["following", viewerId] });
      qc.invalidateQueries({ queryKey: ["feed", "home"] });
    },
  });
}

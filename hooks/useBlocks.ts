import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export type BlockedUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  blocked_at: string;
};

export function useBlockedUsers() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["blocked-users", userId],
    enabled: !!userId,
    queryFn: async (): Promise<BlockedUser[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("blocks")
        .select(
          "created_at, blocked:profiles!blocks_blocked_id_fkey(id, username, display_name, avatar_url)",
        )
        .eq("blocker_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as {
        created_at: string;
        blocked:
          | {
              id: string;
              username: string | null;
              display_name: string | null;
              avatar_url: string | null;
            }
          | {
              id: string;
              username: string | null;
              display_name: string | null;
              avatar_url: string | null;
            }[]
          | null;
      }[];
      return rows
        .map((row) => {
          const b = Array.isArray(row.blocked) ? row.blocked[0] ?? null : row.blocked;
          if (!b) return null;
          return { ...b, blocked_at: row.created_at };
        })
        .filter((u): u is BlockedUser => !!u);
    },
  });
}

function invalidateAfterBlockChange(
  qc: ReturnType<typeof useQueryClient>,
  viewerId: string | undefined,
  targetId: string,
) {
  qc.invalidateQueries({ queryKey: ["blocked-users", viewerId] });
  qc.invalidateQueries({ queryKey: ["feed"] });
  qc.invalidateQueries({ queryKey: ["search-profiles"] });
  qc.invalidateQueries({ queryKey: ["profile-by-username"] });
  qc.invalidateQueries({ queryKey: ["follow-counts", targetId] });
  qc.invalidateQueries({ queryKey: ["follow-counts", viewerId] });
  qc.invalidateQueries({ queryKey: ["followers", targetId] });
  qc.invalidateQueries({ queryKey: ["following", targetId] });
}

export function useBlock(targetUserId: string | undefined) {
  const { session } = useAuth();
  const viewerId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!viewerId) throw new Error("Not signed in");
      if (!targetUserId) throw new Error("Missing target user");
      if (viewerId === targetUserId) throw new Error("Cannot block yourself");
      // Drop any follow relationships in both directions first.
      await supabase
        .from("follows")
        .delete()
        .or(
          `and(follower_id.eq.${viewerId},followee_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},followee_id.eq.${viewerId})`,
        );
      const { error } = await supabase
        .from("blocks")
        .insert({ blocker_id: viewerId, blocked_id: targetUserId });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      if (!targetUserId) return;
      invalidateAfterBlockChange(qc, viewerId, targetUserId);
    },
  });
}

export function useUnblock(targetUserId: string | undefined) {
  const { session } = useAuth();
  const viewerId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!viewerId) throw new Error("Not signed in");
      if (!targetUserId) throw new Error("Missing target user");
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", viewerId)
        .eq("blocked_id", targetUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (!targetUserId) return;
      invalidateAfterBlockChange(qc, viewerId, targetUserId);
    },
  });
}

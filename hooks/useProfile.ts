import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesUpdate } from "@/types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Profile = Tables<"profiles">;

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ["profile-by-username", username],
    enabled: !!username,
    queryFn: async (): Promise<Profile | null> => {
      if (!username) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSearchProfiles(query: string) {
  const trimmed = query.trim().toLowerCase();
  return useQuery({
    queryKey: ["search-profiles", trimmed],
    enabled: trimmed.length > 0,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .ilike("username", `${trimmed}%`)
        .order("username")
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (patch: TablesUpdate<"profiles">) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["profile", userId], data);
    },
  });
}

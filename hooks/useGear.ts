import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Gear = Tables<"gear">;

export function useGear(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["gear", ownerId],
    enabled: !!ownerId,
    queryFn: async (): Promise<Gear[]> => {
      if (!ownerId) return [];
      const { data, error } = await supabase
        .from("gear")
        .select()
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGearItem(id: string | undefined) {
  return useQuery({
    queryKey: ["gear-item", id],
    enabled: !!id && id !== "new",
    queryFn: async (): Promise<Gear | null> => {
      if (!id || id === "new") return null;
      const { data, error } = await supabase
        .from("gear")
        .select()
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

type UpsertGearInput = Omit<TablesInsert<"gear">, "owner_id"> & { id?: string };

export function useUpsertGear() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertGearInput) => {
      if (!userId) throw new Error("Not signed in");
      const { id, ...rest } = input;
      if (id) {
        const { data, error } = await supabase
          .from("gear")
          .update(rest as TablesUpdate<"gear">)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("gear")
        .insert({ ...rest, owner_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gear", userId] });
      qc.invalidateQueries({ queryKey: ["gear-item"] });
    },
  });
}

export function useDeleteGear() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gear").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gear", userId] });
    },
  });
}

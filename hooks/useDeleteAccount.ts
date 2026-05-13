import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_account");
      if (error) throw error;
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}

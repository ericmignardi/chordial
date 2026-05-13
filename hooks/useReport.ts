import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

export type ReportTargetType = "post" | "user" | "comment";

export type ReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
};

export function useReport() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: async ({ targetType, targetId, reason }: ReportInput) => {
      if (!userId) throw new Error("Not signed in");
      const trimmed = reason.trim();
      if (trimmed.length === 0) throw new Error("Reason cannot be empty");
      const { error } = await supabase.from("reports").insert({
        reporter_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason: trimmed,
      });
      if (error) throw error;
    },
  });
}

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

type CommentRaw = Omit<Comment, "author"> & {
  author:
    | NonNullable<Comment["author"]>
    | NonNullable<Comment["author"]>[]
    | null;
};

const COMMENT_SELECT = `
  id, post_id, author_id, body, created_at,
  author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)
`;

function normalize(raw: CommentRaw): Comment {
  const author = Array.isArray(raw.author) ? (raw.author[0] ?? null) : raw.author;
  return { ...raw, author };
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: ["comments", postId],
    enabled: !!postId,
    queryFn: async (): Promise<Comment[]> => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("comments")
        .select(COMMENT_SELECT)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c) => normalize(c as unknown as CommentRaw));
    },
  });
}

export function useCreateComment(postId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: postId, author_id: userId, body })
        .select(COMMENT_SELECT)
        .single();
      if (error) throw error;
      return normalize(data as unknown as CommentRaw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

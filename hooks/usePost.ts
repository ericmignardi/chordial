import { useAuth } from "@/hooks/useAuth";
import { applyLikeToFeedCache } from "@/hooks/post-cache";
import {
  type FeedPost,
  type FeedPostRaw,
  SELECT_COLUMNS,
  normalize,
} from "@/hooks/useFeed";
import { supabase } from "@/lib/supabase";
import { uploadPostImage } from "@/lib/storage";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function usePost(id: string | undefined) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["post", id],
    enabled: !!id,
    queryFn: async (): Promise<FeedPost | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("posts")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .single();
      if (error) throw error;
      return normalize(data as unknown as FeedPostRaw, userId);
    },
  });
}

export function useCreatePost() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caption,
      imageUri,
    }: {
      caption: string | null;
      imageUri: string;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({ author_id: userId, caption })
        .select()
        .single();
      if (postError) throw postError;

      const url = await uploadPostImage(imageUri, userId, post.id, 0);
      const { error: imgError } = await supabase
        .from("post_images")
        .insert({ post_id: post.id, url, ordinal: 0 });
      if (imgError) throw imgError;

      return post;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.removeQueries({ queryKey: ["post", id] });
    },
  });
}

export function useLike(postId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: userId });
      if (error && error.code !== "23505") throw error;
    },
    onMutate: () => {
      if (!userId) return;
      applyLikeToFeedCache(qc, postId, true);
    },
    onError: () => {
      if (!userId) return;
      applyLikeToFeedCache(qc, postId, false);
    },
  });
}

export function useUnlike(postId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: () => {
      if (!userId) return;
      applyLikeToFeedCache(qc, postId, false);
    },
    onError: () => {
      if (!userId) return;
      applyLikeToFeedCache(qc, postId, true);
    },
  });
}

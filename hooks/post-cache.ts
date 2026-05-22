import type { QueryClient } from "@tanstack/react-query";

import type { FeedInfinite, FeedPost } from "@/hooks/useFeed";

function applyLikeState(post: FeedPost, liking: boolean): FeedPost {
  if (post.liked_by_me === liking) return post;

  return {
    ...post,
    liked_by_me: liking,
    likes_count: Math.max(0, post.likes_count + (liking ? 1 : -1)),
  };
}

export function applyLikeToFeedCache(
  qc: QueryClient,
  postId: string,
  liking: boolean,
) {
  qc.setQueriesData<FeedInfinite>({ queryKey: ["feed"] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page.map((post) =>
          post.id === postId ? applyLikeState(post, liking) : post,
        ),
      ),
    };
  });

  qc.setQueryData<FeedPost | null>(["post", postId], (old) => {
    if (!old) return old;
    return applyLikeState(old, liking);
  });
}

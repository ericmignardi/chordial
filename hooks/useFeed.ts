import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  type InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";

export type FeedScope = "home" | "discover";

export type FeedAuthor = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type FeedImage = {
  url: string;
  ordinal: number;
};

export type FeedPost = {
  id: string;
  author_id: string;
  caption: string | null;
  created_at: string;
  author: FeedAuthor | null;
  images: FeedImage[];
  likes_count: number;
  liked_by_me: boolean;
  comments_count: number;
};

type FeedPostRaw = {
  id: string;
  author_id: string;
  caption: string | null;
  created_at: string;
  author: FeedAuthor | FeedAuthor[] | null;
  images: FeedImage[];
  likes: { user_id: string }[];
  comments: { count: number }[];
};

const PAGE_SIZE = 20;

const SELECT_COLUMNS = `
  id, author_id, caption, created_at,
  author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url),
  images:post_images(url, ordinal),
  likes(user_id),
  comments(count)
`;

function normalize(raw: FeedPostRaw, currentUserId: string | undefined): FeedPost {
  const author = Array.isArray(raw.author) ? (raw.author[0] ?? null) : raw.author;
  return {
    id: raw.id,
    author_id: raw.author_id,
    caption: raw.caption,
    created_at: raw.created_at,
    author,
    images: [...raw.images].sort((a, b) => a.ordinal - b.ordinal),
    likes_count: raw.likes.length,
    liked_by_me:
      !!currentUserId && raw.likes.some((l) => l.user_id === currentUserId),
    comments_count: raw.comments[0]?.count ?? 0,
  };
}

export function useFeed(scope: FeedScope) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useInfiniteQuery({
    queryKey: ["feed", scope, userId],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<FeedPost[]> => {
      let q = supabase
        .from("posts")
        .select(SELECT_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (scope === "home") {
        if (!userId) return [];
        const { data: follows, error: fErr } = await supabase
          .from("follows")
          .select("followee_id")
          .eq("follower_id", userId);
        if (fErr) throw fErr;
        const authorIds = [
          ...new Set([userId, ...(follows ?? []).map((f) => f.followee_id)]),
        ];
        if (authorIds.length === 0) return [];
        q = q.in("author_id", authorIds);
      }

      if (pageParam) {
        q = q.lt("created_at", pageParam);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p) => normalize(p as unknown as FeedPostRaw, userId));
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
  });
}

export type FeedInfinite = InfiniteData<FeedPost[]>;
export { SELECT_COLUMNS, normalize };
export type { FeedPostRaw };

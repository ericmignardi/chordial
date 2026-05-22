import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { applyLikeToFeedCache } from "@/hooks/post-cache";
import type { FeedInfinite, FeedPost } from "@/hooks/useFeed";

const targetPostId = "post-1";

function createPost(overrides: Partial<FeedPost> = {}): FeedPost {
  return {
    id: targetPostId,
    author_id: "author-1",
    caption: "Fresh strings day.",
    created_at: "2026-05-22T12:00:00.000Z",
    author: {
      id: "author-1",
      username: "stratline",
      display_name: "Strat Line",
      avatar_url: null,
    },
    images: [{ url: "https://example.com/image.jpg", ordinal: 0 }],
    likes_count: 2,
    liked_by_me: false,
    comments_count: 1,
    ...overrides,
  };
}

function seedCache(qc: QueryClient, post: FeedPost) {
  const otherPost = createPost({
    id: "post-2",
    likes_count: 7,
    liked_by_me: false,
  });
  const feed: FeedInfinite = {
    pages: [[post, otherPost]],
    pageParams: [null],
  };

  qc.setQueryData(["feed", "home", "viewer-1"], feed);
  qc.setQueryData(["feed", "discover", "viewer-1"], feed);
  qc.setQueryData(["post", post.id], post);
}

function getFirstFeedPost(qc: QueryClient, key: unknown[]): FeedPost {
  const feed = qc.getQueryData<FeedInfinite>(key);
  if (!feed) throw new Error("Missing feed cache");
  return feed.pages[0][0];
}

describe("applyLikeToFeedCache", () => {
  it("applies an optimistic like to feed and detail caches", () => {
    const qc = new QueryClient();
    seedCache(qc, createPost());

    applyLikeToFeedCache(qc, targetPostId, true);

    expect(
      getFirstFeedPost(qc, ["feed", "home", "viewer-1"]),
    ).toMatchObject({
      id: targetPostId,
      liked_by_me: true,
      likes_count: 3,
    });
    expect(
      getFirstFeedPost(qc, ["feed", "discover", "viewer-1"]),
    ).toMatchObject({
      id: targetPostId,
      liked_by_me: true,
      likes_count: 3,
    });
    expect(qc.getQueryData<FeedPost>(["post", targetPostId])).toMatchObject({
      liked_by_me: true,
      likes_count: 3,
    });
  });

  it("does not double-count a repeated like mutation", () => {
    const qc = new QueryClient();
    seedCache(qc, createPost({ liked_by_me: true, likes_count: 3 }));

    applyLikeToFeedCache(qc, targetPostId, true);

    expect(
      getFirstFeedPost(qc, ["feed", "home", "viewer-1"]).likes_count,
    ).toBe(3);
    expect(qc.getQueryData<FeedPost>(["post", targetPostId])?.likes_count).toBe(
      3,
    );
  });

  it("applies an optimistic unlike without dropping below zero", () => {
    const qc = new QueryClient();
    seedCache(qc, createPost({ liked_by_me: true, likes_count: 0 }));

    applyLikeToFeedCache(qc, targetPostId, false);

    expect(
      getFirstFeedPost(qc, ["feed", "home", "viewer-1"]),
    ).toMatchObject({
      liked_by_me: false,
      likes_count: 0,
    });
    expect(qc.getQueryData<FeedPost>(["post", targetPostId])).toMatchObject({
      liked_by_me: false,
      likes_count: 0,
    });
  });
});

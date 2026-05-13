import PostActionsSheet from "@/components/post-actions-sheet";
import Avatar from "@/components/ui/avatar";
import type { FeedPost } from "@/hooks/useFeed";
import { useLike, useUnlike } from "@/hooks/usePost";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w`;
  const yr = Math.floor(day / 365);
  if (yr >= 1) return `${yr}y`;
  return `${Math.floor(day / 30)}mo`;
}

type PostCardProps = {
  post: FeedPost;
};

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const like = useLike(post.id);
  const unlike = useUnlike(post.id);
  const sheetRef = useRef<BottomSheetModal>(null);

  const onToggleLike = () => {
    if (post.liked_by_me) unlike.mutate();
    else like.mutate();
  };

  const openDetail = () =>
    router.push({ pathname: "/(app)/post/[id]", params: { id: post.id } });
  const openAuthor = () => {
    if (post.author?.username) {
      router.push({
        pathname: "/(app)/u/[username]",
        params: { username: post.author.username },
      });
    }
  };

  const image = post.images[0];

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-3 px-4 mb-3">
        <Pressable onPress={openAuthor}>
          <Avatar
            uri={post.author?.avatar_url}
            name={post.author?.display_name || post.author?.username || "?"}
            size={40}
          />
        </Pressable>
        <Pressable onPress={openAuthor} className="flex-1">
          {post.author?.display_name && (
            <Text className="font-semibold">{post.author.display_name}</Text>
          )}
          <Text className="text-gray-500 text-sm">
            @{post.author?.username ?? "unknown"}
          </Text>
        </Pressable>
        <Text className="text-gray-400 text-xs">
          {relativeTime(post.created_at)}
        </Text>
        <Pressable
          onPress={() => sheetRef.current?.present()}
          hitSlop={10}
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#374151" />
        </Pressable>
      </View>

      {image && (
        <Pressable onPress={openDetail}>
          <Image
            source={{ uri: image.url }}
            className="w-full aspect-square bg-gray-100"
          />
        </Pressable>
      )}

      <View className="flex-row items-center gap-4 px-4 py-2">
        <Pressable onPress={onToggleLike} hitSlop={8}>
          <Ionicons
            name={post.liked_by_me ? "heart" : "heart-outline"}
            size={26}
            color={post.liked_by_me ? "#059669" : "#111"}
          />
        </Pressable>
        <Pressable onPress={openDetail} hitSlop={8}>
          <Ionicons name="chatbubble-outline" size={22} color="#111" />
        </Pressable>
      </View>

      <View className="px-4">
        <Text className="text-sm text-gray-700">
          {post.likes_count} {post.likes_count === 1 ? "like" : "likes"} ·{" "}
          {post.comments_count}{" "}
          {post.comments_count === 1 ? "comment" : "comments"}
        </Text>
        {post.caption && (
          <Text className="mt-1 font-serif">{post.caption}</Text>
        )}
      </View>

      <PostActionsSheet
        ref={sheetRef}
        postId={post.id}
        authorId={post.author_id}
        authorUsername={post.author?.username}
      />
    </View>
  );
}

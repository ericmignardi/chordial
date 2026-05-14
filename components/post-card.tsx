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
    <View className="px-4 pb-8">
      <View className="flex-row items-center gap-3 py-3.5">
        <Pressable onPress={openAuthor}>
          <Avatar
            uri={post.author?.avatar_url}
            name={post.author?.display_name || post.author?.username || "?"}
            size={40}
          />
        </Pressable>
        <Pressable onPress={openAuthor} className="flex-1">
          {post.author?.display_name && (
            <Text className="font-sans-medium text-[14px] text-ink leading-tight">
              {post.author.display_name}
            </Text>
          )}
          <Text className="text-ink-3 text-[12px] leading-tight">
            @{post.author?.username ?? "unknown"} ·{" "}
            {relativeTime(post.created_at)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => sheetRef.current?.present()}
          hitSlop={10}
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#5A5A58" />
        </Pressable>
      </View>

      {image && (
        <Pressable onPress={openDetail}>
          <Image
            source={{ uri: image.url }}
            className="w-full aspect-square bg-gray-100 rounded-[2px]"
          />
        </Pressable>
      )}

      {post.caption && (
        <Text className="mt-3.5 font-serif text-[18px] leading-[26px] text-ink">
          {post.caption}
        </Text>
      )}

      <View className="flex-row items-center gap-[18px] mt-[18px]">
        <Pressable
          onPress={onToggleLike}
          hitSlop={8}
          className="flex-row items-center gap-1.5"
        >
          <Ionicons
            name={post.liked_by_me ? "heart" : "heart-outline"}
            size={20}
            color={post.liked_by_me ? "#059669" : "#111111"}
          />
          <Text
            className={`text-[14px] font-sans-medium ${
              post.liked_by_me ? "text-emerald-600" : "text-ink"
            }`}
          >
            {post.likes_count}
          </Text>
        </Pressable>
        <Pressable
          onPress={openDetail}
          hitSlop={8}
          className="flex-row items-center gap-1.5"
        >
          <Ionicons name="chatbubble-outline" size={20} color="#111111" />
          <Text className="text-[14px] font-sans-medium text-ink">
            {post.comments_count}
          </Text>
        </Pressable>
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

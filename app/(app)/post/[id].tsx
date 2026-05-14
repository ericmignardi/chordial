import Avatar from "@/components/ui/avatar";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useDeletePost, useLike, useUnlike, usePost } from "@/hooks/usePost";
import { toast } from "@/lib/toast";
import { commentSchema } from "@/validators/comment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

function relativeTime(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w`;
  return `${Math.floor(day / 30)}mo`;
}

export default function PostDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { data: post, isLoading } = usePost(id);
  const { data: comments, isLoading: commentsLoading } = useComments(id);
  const like = useLike(id);
  const unlike = useUnlike(id);
  const deletePost = useDeletePost();
  const createComment = useCreateComment(id);

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const isAuthor = post?.author_id === session?.user.id;

  const onToggleLike = () => {
    if (!post) return;
    if (post.liked_by_me) unlike.mutate();
    else like.mutate();
  };

  const onDelete = () => {
    Alert.alert("Delete this post?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost.mutateAsync(id);
            toast.success("Post deleted");
            router.back();
          } catch (e) {
            const m = e instanceof Error ? e.message : "Could not delete";
            toast.error(m);
          }
        },
      },
    ]);
  };

  const onSend = async () => {
    const parsed = commentSchema.safeParse({ body: body.trim() });
    if (!parsed.success) return;
    setSending(true);
    try {
      await createComment.mutateAsync(parsed.data.body);
      setBody("");
    } catch (e) {
      const m = e instanceof Error ? e.message : "Could not send";
      toast.error(m);
    } finally {
      setSending(false);
    }
  };

  if (isLoading || !post) {
    return (
      <Screen>
        <View className="p-4 gap-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full aspect-square" />
        </View>
      </Screen>
    );
  }

  const image = post.images[0];

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* top nav */}
        <View className="flex-row items-center gap-2 px-3 pb-2.5 border-b border-hair">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#111111" />
          </Pressable>
          <Text className="flex-1 text-center text-[13px] font-sans-medium tracking-[1px] uppercase text-ink-2">
            Post
          </Text>
          {isAuthor ? (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityLabel="Delete post"
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color="#5A5A58"
              />
            </Pressable>
          ) : (
            <View style={{ width: 26 }} />
          )}
        </View>

        <ScrollView keyboardShouldPersistTaps="handled">
          {/* author */}
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <Avatar
              uri={post.author?.avatar_url}
              name={post.author?.display_name || post.author?.username || "?"}
              size={40}
            />
            <View className="flex-1">
              {post.author?.display_name && (
                <Text className="font-sans-medium text-[14px] text-ink leading-tight">
                  {post.author.display_name}
                </Text>
              )}
              <Text className="text-ink-3 text-[12px] leading-tight">
                @{post.author?.username ?? "unknown"} ·{" "}
                {relativeTime(post.created_at)}
              </Text>
            </View>
          </View>

          {image && (
            <Image
              source={{ uri: image.url }}
              className="w-full aspect-square bg-gray-100"
            />
          )}

          <View className="px-4">
            {post.caption && (
              <Text className="mt-3.5 font-serif text-[20px] leading-[28px] text-ink">
                {post.caption}
              </Text>
            )}

            {/* actions */}
            <View className="flex-row items-center gap-[22px] mt-[22px]">
              <Pressable
                onPress={onToggleLike}
                hitSlop={8}
                className="flex-row items-center gap-1.5"
              >
                <Ionicons
                  name={post.liked_by_me ? "heart" : "heart-outline"}
                  size={22}
                  color={post.liked_by_me ? "#059669" : "#111111"}
                />
                <Text
                  className={`text-[15px] font-sans-medium ${
                    post.liked_by_me ? "text-emerald-600" : "text-ink"
                  }`}
                >
                  {post.likes_count}
                </Text>
              </Pressable>
              <View className="flex-row items-center gap-1.5">
                <Ionicons
                  name="chatbubble-outline"
                  size={22}
                  color="#111111"
                />
                <Text className="text-[15px] font-sans-medium text-ink">
                  {post.comments_count}
                </Text>
              </View>
            </View>

            {/* comments */}
            <View className="mt-[26px] pt-[18px] border-t border-hair pb-32 gap-4">
              {commentsLoading ? (
                <Skeleton className="w-full h-10" />
              ) : (comments ?? []).length === 0 ? (
                <Text className="text-ink-3">Be the first to comment.</Text>
              ) : (
                (comments ?? []).map((c) => (
                  <View key={c.id} className="flex-row gap-2.5">
                    <Avatar
                      uri={c.author?.avatar_url}
                      name={
                        c.author?.display_name || c.author?.username || "?"
                      }
                      size={32}
                    />
                    <View className="flex-1">
                      <Text className="text-[13px] leading-tight">
                        {c.author?.display_name && (
                          <Text className="font-sans-medium text-ink">
                            {c.author.display_name}
                          </Text>
                        )}
                        <Text className="text-ink-3">
                          {c.author?.display_name ? " · " : ""}@
                          {c.author?.username ?? "unknown"} ·{" "}
                          {relativeTime(c.created_at)}
                        </Text>
                      </Text>
                      <Text className="mt-1 text-[14px] leading-[20px] text-ink">
                        {c.body}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* composer pinned */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-hair bg-surface px-4 pt-3 pb-7 flex-row items-center gap-2.5">
          <Avatar name="You" size={32} />
          <View className="flex-1 h-10 rounded-2xl border border-hair px-3.5 justify-center">
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Add a comment…"
              placeholderTextColor="#9A9A98"
              className="text-[14px] text-ink"
            />
          </View>
          <Pressable
            onPress={onSend}
            disabled={sending || body.trim().length === 0}
            className="px-4 h-10 rounded-2xl bg-emerald-600 items-center justify-center active:opacity-80 disabled:opacity-40"
          >
            <Text className="text-white font-sans-medium text-[14px]">Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

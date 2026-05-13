import Avatar from "@/components/ui/avatar";
import Input from "@/components/ui/input";
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
  View,
} from "react-native";

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
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center gap-3 p-4">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={28} color="#111" />
            </Pressable>
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar
                uri={post.author?.avatar_url}
                name={post.author?.display_name || post.author?.username || "?"}
                size={40}
              />
              <View className="flex-1">
                {post.author?.display_name && (
                  <Text className="font-semibold">
                    {post.author.display_name}
                  </Text>
                )}
                <Text className="text-gray-500 text-sm">
                  @{post.author?.username ?? "unknown"}
                </Text>
              </View>
            </View>
            {isAuthor && (
              <Pressable onPress={onDelete} hitSlop={8}>
                <Ionicons name="trash-outline" size={22} color="#dc2626" />
              </Pressable>
            )}
          </View>

          {image && (
            <Image
              source={{ uri: image.url }}
              className="w-full aspect-square bg-gray-100"
            />
          )}

          <View className="flex-row items-center gap-4 px-4 py-3">
            <Pressable onPress={onToggleLike} hitSlop={8}>
              <Ionicons
                name={post.liked_by_me ? "heart" : "heart-outline"}
                size={28}
                color={post.liked_by_me ? "#059669" : "#111"}
              />
            </Pressable>
            <Ionicons name="chatbubble-outline" size={24} color="#111" />
          </View>

          <View className="px-4 mb-4">
            <Text className="text-sm text-gray-700">
              {post.likes_count} {post.likes_count === 1 ? "like" : "likes"}
            </Text>
            {post.caption && (
              <Text className="mt-1 font-serif text-base">{post.caption}</Text>
            )}
          </View>

          <View className="px-4 pb-32">
            <Text className="text-base font-bold mb-3">Comments</Text>
            {commentsLoading ? (
              <Skeleton className="w-full h-10" />
            ) : (comments ?? []).length === 0 ? (
              <Text className="text-gray-500">Be the first to comment.</Text>
            ) : (
              (comments ?? []).map((c) => (
                <View key={c.id} className="flex-row gap-3 py-2">
                  <Avatar
                    uri={c.author?.avatar_url}
                    name={c.author?.display_name || c.author?.username || "?"}
                    size={32}
                  />
                  <View className="flex-1">
                    <Text className="text-sm">
                      <Text className="font-semibold">
                        @{c.author?.username ?? "unknown"}
                      </Text>{" "}
                      <Text>{c.body}</Text>
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-3 flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              value={body}
              onChangeText={setBody}
              placeholder="Add a comment..."
            />
          </View>
          <Pressable
            onPress={onSend}
            disabled={sending || body.trim().length === 0}
            className="px-4 py-3 rounded-2xl bg-emerald-600 active:opacity-80 disabled:opacity-40"
          >
            <Text className="text-white font-medium">Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

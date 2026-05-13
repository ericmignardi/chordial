import Avatar from "@/components/ui/avatar";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import {
  type FollowUser,
  useFollowers,
  useFollowing,
} from "@/hooks/useFollows";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function FollowList() {
  const router = useRouter();
  const { userId, type } = useLocalSearchParams<{
    userId: string;
    type: "followers" | "following";
  }>();

  const followers = useFollowers(type === "followers" ? userId : undefined);
  const following = useFollowing(type === "following" ? userId : undefined);
  const { data, isLoading } = type === "followers" ? followers : following;

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-6 pt-2 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text className="text-2xl font-bold">{title}</Text>
      </View>

      {isLoading ? (
        <View className="px-6 gap-3">
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-full h-12 rounded" />
        </View>
      ) : (data ?? []).length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-500">
            {type === "followers" ? "No followers yet." : "Not following anyone yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          renderItem={({ item }: { item: FollowUser }) => (
            <Pressable
              onPress={() => {
                if (!item.username) return;
                router.push({
                  pathname: "/(app)/u/[username]",
                  params: { username: item.username },
                });
              }}
              className="flex-row items-center gap-3 py-3 active:opacity-60"
            >
              <Avatar
                uri={item.avatar_url}
                name={item.display_name ?? item.username ?? "?"}
                size={40}
              />
              <View className="flex-1">
                {item.display_name && (
                  <Text className="font-semibold">{item.display_name}</Text>
                )}
                <Text className="text-gray-500 text-sm">
                  @{item.username ?? "unknown"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

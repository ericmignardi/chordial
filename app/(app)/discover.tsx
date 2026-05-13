import PostCard from "@/components/post-card";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useFeed } from "@/hooks/useFeed";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Discover() {
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("discover");

  const posts = data?.pages.flat() ?? [];

  return (
    <Screen>
      <View className="px-4 pt-2 pb-3">
        <Text className="text-3xl font-bold">Discover</Text>
      </View>

      {isLoading ? (
        <View className="px-4 gap-4">
          <Skeleton className="w-full h-80 rounded-2xl" />
          <Skeleton className="w-full h-80 rounded-2xl" />
        </View>
      ) : posts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-xl font-bold mb-2 text-center">
            No posts yet.
          </Text>
          <Text className="text-gray-600 text-center">
            Be the first — every Chordial feed starts somewhere.
          </Text>
        </View>
      ) : (
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-6">
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

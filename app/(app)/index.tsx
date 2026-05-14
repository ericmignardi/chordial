import PostCard from "@/components/post-card";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useFeed } from "@/hooks/useFeed";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("home");

  const posts = data?.pages.flat() ?? [];

  return (
    <Screen>
      <View className="flex-row items-end justify-between px-4 pt-2 pb-4 border-b border-hair">
        <View>
          <Text className="text-[10px] tracking-[1.6px] uppercase text-ink-3 font-sans-medium">
            {format(new Date(), "EEEE, MMMM d")}
          </Text>
          <Text className="mt-1.5 font-serif text-[36px] leading-none text-ink">
            Home
          </Text>
        </View>
        <Ionicons name="bookmark-outline" size={22} color="#5A5A58" />
      </View>

      {isLoading ? (
        <View className="px-4 pt-4 gap-4">
          <Skeleton className="w-full h-80 rounded-[2px]" />
          <Skeleton className="w-full h-80 rounded-[2px]" />
        </View>
      ) : posts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="font-serif text-2xl text-ink mb-2 text-center">
            Your feed is quiet.
          </Text>
          <Text className="text-ink-2 mb-6 text-center leading-relaxed">
            Make your first post, or head to Discover to see what other players
            are sharing.
          </Text>
          <Button size="md" onPress={() => router.push("/(app)/discover")}>
            Open Discover
          </Button>
        </View>
      ) : (
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ItemSeparatorComponent={() => (
            <View className="border-t border-hair" />
          )}
          ListHeaderComponent={<View className="h-2" />}
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

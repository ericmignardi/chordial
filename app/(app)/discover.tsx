import PostCard from "@/components/post-card";
import Avatar from "@/components/ui/avatar";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useFeed } from "@/hooks/useFeed";
import { useSearchProfiles } from "@/hooks/useProfile";
import { FlashList } from "@shopify/flash-list";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Discover() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("discover");

  const { data: searchResults, isLoading: searching } =
    useSearchProfiles(debounced);

  const posts = data?.pages.flat() ?? [];
  const showSearch = debounced.length > 0;

  return (
    <Screen>
      <View className="px-4 pt-2 pb-4 border-b border-hair">
        <Text className="text-[10px] tracking-[1.6px] uppercase text-ink-3 font-sans-medium">
          Find players &amp; gear
        </Text>
        <Text className="mt-1.5 mb-3.5 font-serif text-[36px] leading-none text-ink">
          Discover
        </Text>
        <View className="flex-row items-center border border-hair rounded-2xl px-3 h-11">
          <Ionicons name="search" size={18} color="#9A9A98" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search usernames"
            placeholderTextColor="#9A9A98"
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 ml-2 text-[15px] text-ink"
            accessibilityLabel="Search users by username"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9A9A98" />
            </Pressable>
          )}
        </View>
      </View>

      {showSearch ? (
        searching ? (
          <View className="px-4 pt-4 gap-2">
            <Skeleton className="w-full h-12 rounded" />
            <Skeleton className="w-full h-12 rounded" />
          </View>
        ) : (searchResults ?? []).length === 0 ? (
          <View className="px-4 py-10">
            <Text className="text-ink-3 text-center">
              No users match &quot;{debounced}&quot;.
            </Text>
          </View>
        ) : (
          <FlashList
            data={searchResults ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  if (!item.username) return;
                  router.push({
                    pathname: "/(app)/u/[username]",
                    params: { username: item.username },
                  });
                }}
                className="flex-row items-center gap-3 px-4 py-3 border-t border-hair active:opacity-60"
              >
                <Avatar
                  uri={item.avatar_url}
                  name={item.display_name ?? item.username ?? "?"}
                  size={40}
                />
                <View className="flex-1">
                  {item.display_name && (
                    <Text className="font-sans-medium text-[14px] text-ink">
                      {item.display_name}
                    </Text>
                  )}
                  <Text className="text-ink-3 text-[12px]">
                    @{item.username ?? "unknown"}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )
      ) : isLoading ? (
        <View className="px-4 pt-4 gap-4">
          <Skeleton className="w-full h-80 rounded-[2px]" />
          <Skeleton className="w-full h-80 rounded-[2px]" />
        </View>
      ) : posts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="font-serif text-2xl text-ink mb-2 text-center">
            No posts yet.
          </Text>
          <Text className="text-ink-2 text-center leading-relaxed">
            Be the first — every Chordial feed starts somewhere.
          </Text>
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

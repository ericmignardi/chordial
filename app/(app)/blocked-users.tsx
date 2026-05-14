import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { type BlockedUser, useBlockedUsers, useUnblock } from "@/hooks/useBlocks";
import { toast } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

function BlockedRow({ user }: { user: BlockedUser }) {
  const unblock = useUnblock(user.id);

  const onUnblock = async () => {
    try {
      await unblock.mutateAsync();
      toast.success(`Unblocked @${user.username ?? "user"}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not unblock";
      toast.error(message);
    }
  };

  return (
    <View className="flex-row items-center gap-3 py-3 border-t border-hair">
      <Avatar
        uri={user.avatar_url}
        name={user.display_name ?? user.username ?? "?"}
        size={40}
      />
      <View className="flex-1">
        {user.display_name && (
          <Text className="font-sans-medium text-[14px] text-ink">
            {user.display_name}
          </Text>
        )}
        <Text className="text-ink-3 text-[12px]">
          @{user.username ?? "unknown"}
        </Text>
      </View>
      <Button
        size="sm"
        variant="secondary"
        onPress={onUnblock}
        loading={unblock.isPending}
      >
        Unblock
      </Button>
    </View>
  );
}

export default function BlockedUsers() {
  const router = useRouter();
  const { data, isLoading } = useBlockedUsers();

  return (
    <Screen>
      <View className="px-4 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </Pressable>
        <Text className="mt-2 font-serif text-[34px] leading-none text-ink">
          Blocked users
        </Text>
      </View>

      {isLoading ? (
        <View className="px-4 gap-3">
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-full h-12 rounded" />
        </View>
      ) : (data ?? []).length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-ink-3 text-center">
            You haven&apos;t blocked anyone.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => <BlockedRow user={item} />}
        />
      )}
    </Screen>
  );
}

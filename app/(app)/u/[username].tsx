import GearItem from "@/components/gear-item";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import UserActionsSheet from "@/components/user-actions-sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  useFollow,
  useFollowCounts,
  useUnfollow,
} from "@/hooks/useFollows";
import { useGear } from "@/hooks/useGear";
import { useProfileByUsername } from "@/hooks/useProfile";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Pressable, Text, View } from "react-native";

export default function UserProfile() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { session } = useAuth();
  const viewerId = session?.user.id;

  const { data: profile, isLoading } = useProfileByUsername(username);
  const targetId = profile?.id;
  const { data: gear, isLoading: gearLoading } = useGear(targetId);
  const { data: counts } = useFollowCounts(targetId);
  const follow = useFollow(targetId);
  const unfollow = useUnfollow(targetId);
  const sheetRef = useRef<BottomSheetModal>(null);

  const isSelf = !!viewerId && viewerId === targetId;

  if (isLoading) {
    return (
      <Screen scroll>
        <View className="p-4 gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-40 h-7 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="font-serif text-2xl text-ink mb-2 text-center">
            User not found.
          </Text>
          <Text className="text-ink-2 text-center mb-6">
            We couldn&apos;t find @{username}.
          </Text>
          <Button onPress={() => router.back()} variant="secondary" size="md">
            Go back
          </Button>
        </View>
      </Screen>
    );
  }

  const onToggleFollow = () => {
    if (counts?.is_following) unfollow.mutate();
    else follow.mutate();
  };

  return (
    <Screen scroll>
      {/* top bar */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </Pressable>
        {!isSelf && (
          <Pressable
            onPress={() => sheetRef.current?.present()}
            hitSlop={12}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#5A5A58" />
          </Pressable>
        )}
      </View>

      {/* identity */}
      <View className="px-4 pb-6">
        <Avatar
          uri={profile.avatar_url}
          name={profile.display_name ?? profile.username ?? "?"}
          size={96}
        />

        {profile.display_name && (
          <Text className="mt-[18px] font-serif text-[28px] leading-tight text-ink">
            {profile.display_name}
          </Text>
        )}
        <Text className="mt-0.5 text-[13px] text-ink-3">
          @{profile.username}
        </Text>
        {profile.location && (
          <Text className="mt-2 text-[13px] text-ink-3">
            {profile.location}
          </Text>
        )}
        {profile.bio && (
          <Text className="mt-3.5 text-[15px] leading-[22px] text-ink">
            {profile.bio}
          </Text>
        )}

        {/* stats */}
        <View className="flex-row gap-6 mt-[18px]">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/follow-list",
                params: { userId: targetId!, type: "followers" },
              })
            }
            hitSlop={8}
          >
            <Text className="text-[13px] text-ink-2">
              <Text className="text-ink font-sans-medium text-[15px]">
                {counts?.followers ?? 0}
              </Text>{" "}
              Followers
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/follow-list",
                params: { userId: targetId!, type: "following" },
              })
            }
            hitSlop={8}
          >
            <Text className="text-[13px] text-ink-2">
              <Text className="text-ink font-sans-medium text-[15px]">
                {counts?.following ?? 0}
              </Text>{" "}
              Following
            </Text>
          </Pressable>
        </View>

        {!isSelf && (
          <View className="mt-[18px]">
            <Button
              variant={counts?.is_following ? "secondary" : "primary"}
              size="md"
              onPress={onToggleFollow}
              loading={follow.isPending || unfollow.isPending}
            >
              {counts?.is_following ? "Following" : "Follow"}
            </Button>
          </View>
        )}
      </View>

      {/* Rig */}
      <View className="px-4 border-t border-hair">
        <View className="flex-row items-baseline justify-between pt-5 pb-3">
          <Text className="font-serif text-[22px] text-ink">Rig</Text>
          <Text className="text-[11px] tracking-[1px] uppercase text-ink-3 font-sans-medium">
            {(gear ?? []).length} items
          </Text>
        </View>

        {gearLoading ? (
          <View className="gap-2">
            <Skeleton className="w-full h-12 rounded" />
            <Skeleton className="w-full h-12 rounded" />
          </View>
        ) : (gear ?? []).length === 0 ? (
          <Text className="text-ink-3 text-[13px] pb-2">
            No gear listed yet.
          </Text>
        ) : (
          <View>
            {(gear ?? []).map((item) => (
              <GearItem key={item.id} gear={item} />
            ))}
          </View>
        )}
      </View>

      <View className="h-8" />

      {!isSelf && targetId && (
        <UserActionsSheet
          ref={sheetRef}
          targetUserId={targetId}
          username={profile.username}
          onBlocked={() => router.back()}
        />
      )}
    </Screen>
  );
}

import GearItem from "@/components/gear-item";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useFollow,
  useFollowCounts,
  useUnfollow,
} from "@/hooks/useFollows";
import { useGear } from "@/hooks/useGear";
import { useProfileByUsername } from "@/hooks/useProfile";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
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

  const isSelf = !!viewerId && viewerId === targetId;

  if (isLoading) {
    return (
      <Screen scroll>
        <View className="p-8 gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-40 h-6 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-xl font-bold mb-2">User not found.</Text>
          <Text className="text-gray-600 text-center mb-6">
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
      <View className="p-8">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color="#111" />
          </Pressable>
        </View>

        <View className="items-center mb-4">
          <Avatar
            uri={profile.avatar_url}
            name={profile.display_name ?? profile.username ?? "?"}
            size={96}
          />
        </View>

        {profile.display_name && (
          <Text className="text-2xl font-serif font-semibold text-center">
            {profile.display_name}
          </Text>
        )}
        <Text className="text-gray-500 text-center mb-3">
          @{profile.username}
        </Text>

        {profile.bio && (
          <Text className="text-center text-gray-700 mb-2">{profile.bio}</Text>
        )}
        {profile.location && (
          <Text className="text-center text-gray-500 text-sm mb-4">
            {profile.location}
          </Text>
        )}

        <View className="flex-row justify-center gap-6 mb-6">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/follow-list",
                params: { userId: targetId!, type: "followers" },
              })
            }
            hitSlop={8}
          >
            <Text className="text-gray-700 text-center">
              <Text className="font-bold">{counts?.followers ?? 0}</Text>{" "}
              followers
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
            <Text className="text-gray-700 text-center">
              <Text className="font-bold">{counts?.following ?? 0}</Text>{" "}
              following
            </Text>
          </Pressable>
        </View>

        {!isSelf && (
          <Button
            variant={counts?.is_following ? "secondary" : "primary"}
            size="md"
            onPress={onToggleFollow}
            loading={follow.isPending || unfollow.isPending}
          >
            {counts?.is_following ? "Following" : "Follow"}
          </Button>
        )}

        <View className="mt-10">
          <Text className="text-xl font-bold mb-2">Rig</Text>

          {gearLoading ? (
            <View className="gap-2">
              <Skeleton className="w-full h-12 rounded" />
              <Skeleton className="w-full h-12 rounded" />
            </View>
          ) : (gear ?? []).length === 0 ? (
            <Text className="text-gray-500 text-sm mt-2">
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
      </View>
    </Screen>
  );
}

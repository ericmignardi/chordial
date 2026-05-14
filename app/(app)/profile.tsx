import GearItem from "@/components/gear-item";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useFollowCounts } from "@/hooks/useFollows";
import { useGear } from "@/hooks/useGear";
import { useProfile } from "@/hooks/useProfile";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Profile() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: gear, isLoading: gearLoading } = useGear(userId);
  const { data: counts } = useFollowCounts(userId);

  if (profileLoading || !profile) {
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

  return (
    <Screen scroll>
      {/* top bar */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2.5">
        <Text className="text-[13px] font-sans-medium tracking-[1px] uppercase text-ink-2">
          @{profile.username}
        </Text>
        <Pressable onPress={() => router.push("/(app)/settings")} hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#5A5A58" />
        </Pressable>
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
        {profile.location && (
          <Text className="mt-1 text-[13px] text-ink-3">
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
                params: { userId: userId!, type: "followers" },
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
                params: { userId: userId!, type: "following" },
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

        {/* CTA */}
        <View className="mt-[18px]">
          <Button
            variant="secondary"
            size="md"
            onPress={() => router.push("/(app)/edit-profile")}
          >
            Edit profile
          </Button>
        </View>
      </View>

      {/* My Rig */}
      <View className="px-4 border-t border-hair">
        <View className="flex-row items-baseline justify-between pt-5 pb-3">
          <Text className="font-serif text-[22px] text-ink">My Rig</Text>
          <Text className="text-[11px] tracking-[1px] uppercase text-ink-3 font-sans-medium">
            {(gear ?? []).length} items
          </Text>
        </View>

        {gearLoading ? (
          <View className="gap-2">
            <Skeleton className="w-full h-12 rounded" />
            <Skeleton className="w-full h-12 rounded" />
          </View>
        ) : (
          <View>
            {(gear ?? []).map((item) => (
              <GearItem
                key={item.id}
                gear={item}
                onPress={() => router.push(`/(app)/gear/${item.id}`)}
              />
            ))}

            <Pressable
              onPress={() => router.push("/(app)/gear/new")}
              className="flex-row items-center gap-3 py-3.5 border-t border-hair active:opacity-60"
            >
              <View className="w-7 h-7 items-center justify-center">
                <Ionicons name="add" size={20} color="#059669" />
              </View>
              <Text className="text-emerald-600 font-sans-medium text-[15px]">
                Add gear
              </Text>
            </Pressable>

            {(!gear || gear.length === 0) && (
              <Text className="text-ink-3 text-[13px] mt-2 pb-2">
                Your Rig is empty. Add the first piece.
              </Text>
            )}
          </View>
        )}
      </View>

      <View className="h-8" />
    </Screen>
  );
}

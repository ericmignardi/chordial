import GearItem from "@/components/gear-item";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Skeleton from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
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

  if (profileLoading || !profile) {
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

  return (
    <Screen scroll>
      <View className="p-8">
        <View className="flex-row justify-end mb-4">
          <Pressable
            onPress={() => router.push("/(app)/settings")}
            hitSlop={12}
          >
            <Ionicons name="settings-outline" size={24} color="#111" />
          </Pressable>
        </View>

        <View className="items-center mb-4">
          <Avatar uri={profile.avatar_url} name={profile.display_name ?? profile.username ?? "?"} size={96} />
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

        <Text className="text-center text-gray-500 mb-6">
          0 followers · 0 following
        </Text>

        <Button
          variant="secondary"
          size="md"
          onPress={() => router.push("/(app)/edit-profile")}
        >
          Edit profile
        </Button>

        <View className="mt-10">
          <Text className="text-xl font-bold mb-2">My Rig</Text>

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
                className="flex-row items-center gap-3 py-3 active:opacity-60"
              >
                <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                  <Ionicons name="add" size={22} color="#059669" />
                </View>
                <Text className="text-emerald-600 font-medium">Add gear</Text>
              </Pressable>

              {(!gear || gear.length === 0) && (
                <Text className="text-gray-500 text-sm mt-2">
                  Your Rig is empty. Add the first piece.
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

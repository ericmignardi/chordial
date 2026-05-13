import Screen from "@/components/ui/screen";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

const PRIVACY_URL = "https://chordial.app/privacy";
const TERMS_URL = "https://chordial.app/terms";

type Row = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export default function Settings() {
  const router = useRouter();
  const { signOut } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    const { error } = await signOut();
    setSigningOut(false);
    if (error) Alert.alert("Sign out failed", error.message);
    else router.replace("/(auth)/sign-in");
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This permanently deletes your account, posts, gear, and follows. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount.mutateAsync();
              router.replace("/(auth)/sign-up");
            } catch (e) {
              const message =
                e instanceof Error ? e.message : "Could not delete account";
              Alert.alert("Delete failed", message);
            }
          },
        },
      ],
    );
  };

  const rows: Row[] = [
    {
      label: "Edit profile",
      icon: "person-outline",
      onPress: () => router.push("/(app)/edit-profile"),
    },
    {
      label: "Blocked users",
      icon: "ban-outline",
      onPress: () => router.push("/(app)/blocked-users"),
    },
    {
      label: "Privacy policy",
      icon: "shield-outline",
      onPress: () => Linking.openURL(PRIVACY_URL),
    },
    {
      label: "Terms of service",
      icon: "document-text-outline",
      onPress: () => Linking.openURL(TERMS_URL),
    },
    {
      label: signingOut ? "Signing out..." : "Sign out",
      icon: "log-out-outline",
      onPress: onSignOut,
    },
    {
      label: deleteAccount.isPending ? "Deleting..." : "Delete account",
      icon: "trash-outline",
      destructive: true,
      onPress: onDeleteAccount,
    },
  ];

  return (
    <Screen scroll>
      <View className="p-8">
        <View className="flex-row items-center gap-3 mb-6">
          <Pressable onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color="#111" />
          </Pressable>
          <Text className="text-3xl font-bold">Settings</Text>
        </View>

        <View className="flex-col">
          {rows.map((row) => (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              disabled={row.disabled || !row.onPress}
              accessibilityLabel={row.label}
              accessibilityRole="button"
              className={`flex-row items-center gap-4 py-4 border-b border-gray-100 ${
                row.disabled ? "opacity-40" : "active:opacity-60"
              }`}
            >
              <Ionicons
                name={row.icon}
                size={22}
                color={row.destructive ? "#dc2626" : "#374151"}
              />
              <Text
                className={`flex-1 text-base ${
                  row.destructive ? "text-red-600" : "text-gray-900"
                }`}
              >
                {row.label}
              </Text>
              {!row.disabled && (
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

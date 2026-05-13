import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function AppLayout() {
  const { session, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading) return null;
  if (!session) return <Redirect href={"/(auth)/sign-up"} />;
  if (profileLoading) return null;
  if (!profile?.username) return <Redirect href={"/(auth)/onboarding"} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#000",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "",
          tabBarIcon: () => (
            <View className="w-12 h-12 rounded-full bg-emerald-600 items-center justify-center -mt-4">
              <Ionicons name="add" size={26} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="gear/[id]" options={{ href: null }} />
      <Tabs.Screen name="post/[id]" options={{ href: null }} />
      <Tabs.Screen name="u/[username]" options={{ href: null }} />
      <Tabs.Screen name="follow-list" options={{ href: null }} />
    </Tabs>
  );
}

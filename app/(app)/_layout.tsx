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
        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#9A9A98",
        tabBarStyle: {
          backgroundColor: "#FAFAF7",
          borderTopColor: "rgba(0,0,0,0.07)",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontWeight: "500",
        },
        tabBarItemStyle: { paddingTop: 6 },
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
              size={22}
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
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "New",
          tabBarLabelStyle: { display: "none" },
          tabBarIcon: () => (
            <View
              className="rounded-full bg-emerald-600 items-center justify-center -mt-6"
              style={{
                width: 56,
                height: 56,
                borderWidth: 4,
                borderColor: "#FAFAF7",
                shadowColor: "#059669",
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Ionicons name="add" size={26} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={22}
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
      <Tabs.Screen name="blocked-users" options={{ href: null }} />
    </Tabs>
  );
}

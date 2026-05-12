import { useAuth } from "@/hooks/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

export default function AppLayout() {
  const { signOut, session, loading } = useAuth();
  const [signingOut, setSigningOut] = useState<boolean>(false);

  const onSignOut = async () => {
    setSigningOut(true);
    const { error } = await signOut();
    setSigningOut(false);
    if (error) Alert.alert("Sign out failed", error.message);
  };

  if (loading) return null;

  if (!session) return <Redirect href={"/(auth)/sign-up"} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // headerRight: () => (
        //   <Pressable
        //     disabled={signingOut}
        //     onPress={onSignOut}
        //     style={{ marginRight: 16 }}
        //   >
        //     <Text>{signingOut ? "..." : "Sign out"}</Text>
        //   </Pressable>
        // ),
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#000",
        tabBarLabelStyle: { color: "#000" },
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
    </Tabs>
  );
}

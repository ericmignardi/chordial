import { useAuth } from "@/hooks/useAuth";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text } from "react-native";

export default function TabsLayout() {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState<boolean>(false);

  const onSignOut = async () => {
    setSigningOut(true);
    const { error } = await signOut();
    setSigningOut(false);
    if (error) Alert.alert("Sign out failed", error.message);
  };

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <Pressable
            disabled={signingOut}
            onPress={onSignOut}
            style={{ marginRight: 16 }}
          >
            <Text>{signingOut ? "..." : "Sign out"}</Text>
          </Pressable>
        ),
      }}
    />
  );
}

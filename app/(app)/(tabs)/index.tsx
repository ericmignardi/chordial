import { useAuth } from "@/providers/auth-provider";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const onSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    setLoading(false);
    if (error) Alert.alert("Sign out failed", error.message);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Pressable disabled={loading} onPress={onSignOut}>
        <Text>{loading ? "Signing out..." : "Sign out"}</Text>
      </Pressable>
    </View>
  );
}

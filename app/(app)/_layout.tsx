import { useAuth } from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (!session) return <Redirect href={"/(auth)/sign-up"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

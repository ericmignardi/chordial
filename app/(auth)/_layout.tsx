import { useAuth } from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (session) return <Redirect href={"/"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

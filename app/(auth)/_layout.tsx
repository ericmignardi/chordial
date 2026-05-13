import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading) return null;
  if (session && profileLoading) return null;
  if (session && profile?.username) return <Redirect href={"/"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

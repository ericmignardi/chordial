import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const segments = useSegments() as readonly string[];

  if (loading) return null;

  if (session) {
    if (profileLoading) return null;

    if (profile?.username) {
      return <Redirect href="/(app)/discover" />;
    }

    // If we have a session but no username, we should be on onboarding.
    // Check segments to avoid redirect loops.
    const isOnboarding = segments.includes("onboarding");
    if (!isOnboarding) {
      return <Redirect href="/(auth)/onboarding" />;
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

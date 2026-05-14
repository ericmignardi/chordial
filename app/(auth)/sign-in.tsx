import AuthField from "@/components/ui/auth-field";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import { useAuth } from "@/hooks/useAuth";
import { authSchema } from "@/validators/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    const result = authSchema.safeParse({ email, password });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await signIn(result.data.email, result.data.password);
    setLoading(false);

    if (error) {
      setError(error.message);
    }
  };

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/sign-up");
  };

  return (
    <Screen>
      <View className="flex-1">
        <View className="px-3 pt-2 pb-2.5">
          <Pressable onPress={onBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#111111" />
          </Pressable>
        </View>

        <View className="flex-1 px-6 pt-2">
          <Text className="text-[10px] tracking-[3px] uppercase text-ink-3 font-sans-medium">
            Welcome back
          </Text>
          <Text className="mt-2 font-serif text-[36px] leading-none text-ink">
            Sign in
          </Text>

          <View className="mt-8 gap-[22px]">
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              secureTextEntry
            />
          </View>

          {error && (
            <Text className="text-red-600 text-center text-[13px] mt-5">
              {error}
            </Text>
          )}
        </View>

        <View className="px-5 pb-9">
          <Button onPress={onSubmit} loading={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <Text className="mt-3.5 text-center text-[13px] text-ink-3">
            New here?{" "}
            <Link
              href="/(auth)/sign-up"
              className="text-ink font-sans-medium underline"
            >
              Create account
            </Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}

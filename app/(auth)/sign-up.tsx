import AuthField from "@/components/ui/auth-field";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import { useAuth } from "@/hooks/useAuth";
import { authSchema } from "@/validators/auth";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function SignUp() {
  const { signUp } = useAuth();
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
    const { error, needsEmailConfirmation } = await signUp(
      result.data.email,
      result.data.password,
    );
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (needsEmailConfirmation) {
      Alert.alert(
        "Check your email",
        "We sent a confirmation link to complete your sign up.",
      );
      return;
    }

    router.replace("/(auth)/onboarding");
  };

  return (
    <Screen>
      <View className="flex-1">
        <View className="flex-1 px-6 pt-4">
          <Text className="text-[10px] tracking-[3px] uppercase text-ink-3 font-sans-medium">
            Begin
          </Text>
          <Text className="mt-2 font-serif text-[36px] leading-none text-ink">
            Create your account
          </Text>
          <Text className="mt-2.5 text-[14px] leading-[20px] text-ink-2">
            Your email and a password is all we need to get you posting.
          </Text>

          <View className="mt-7 gap-[22px]">
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
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <Text className="mt-3.5 text-center text-[13px] text-ink-3">
            Have an account already?{" "}
            <Link
              href="/(auth)/sign-in"
              className="text-ink font-sans-medium underline"
            >
              Sign in
            </Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}

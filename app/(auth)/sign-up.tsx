import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { useAuth } from "@/hooks/useAuth";
import { authSchema } from "@/validators/auth";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function SignUp() {
  const { signUp } = useAuth();
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
    }
  };

  return (
    <Screen>
      <View className="flex-1 flex flex-col gap-4 p-8">
        <Text className="text-4xl font-bold">Sign up</Text>
        <View className="flex flex-col gap-4 justify-center">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="password"
          />
          <Button onPress={onSubmit} loading={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </Button>
          {error && (
            <View>
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}
          <View className="flex justify-center items-center">
            <Text>
              Already have account?{" "}
              <Link
                href="/(auth)/sign-in"
                className="text-emerald-600 underline"
              >
                Sign in
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

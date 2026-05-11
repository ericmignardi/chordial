import { useAuth } from "@/providers/auth-provider";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 flex flex-col gap-4 p-8">
        <Text className="text-4xl font-bold">Sign in</Text>
        <View className="flex flex-col gap-4 justify-center">
          <TextInput
            className="focus:outline-none border border-gray-300 p-4 rounded-2xl placeholder:text-gray-400"
            value={email}
            onChangeText={setEmail}
            placeholder="email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            className="focus:outline-none border border-gray-300 p-4 rounded-2xl placeholder:text-gray-400"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="password"
          />
          <Pressable
            className="flex justify-center items-center bg-emerald-600 px-4 py-6 rounded-2xl active:opacity-80 disabled:opacity-50"
            disabled={loading}
            onPress={onSubmit}
          >
            <Text className="text-white font-medium text-xl">
              {loading ? "Signing in..." : "Sign in"}
            </Text>
          </Pressable>
          {error && (
            <View>
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}
          <View className="flex justify-center items-center">
            <Text>
              Don&apos;t already have an account?{" "}
              <Link
                href="/(auth)/sign-up"
                className="text-emerald-600 underline"
              >
                Sign up
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

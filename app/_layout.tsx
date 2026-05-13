import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import { ErrorBoundaryProps, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import "../global.css";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-white">
      <Text className="text-2xl font-bold mb-2">Something went wrong</Text>
      <Text className="text-gray-600 text-center mb-6">{error.message}</Text>
      <Pressable
        onPress={retry}
        className="bg-emerald-600 px-6 py-4 rounded-2xl active:opacity-80"
      >
        <Text className="text-white font-medium">Try again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </AuthProvider>
    </QueryProvider>
  );
}

import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  useFonts,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ErrorBoundaryProps, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "../global.css";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-surface">
      <Text className="font-serif text-[28px] text-ink mb-2 text-center">
        Something went wrong
      </Text>
      <Text className="text-ink-2 text-center mb-6">{error.message}</Text>
      <Pressable
        onPress={retry}
        className="bg-emerald-600 px-6 py-4 rounded-2xl active:opacity-80"
      >
        <Text className="text-white font-sans-medium">Try again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <Toast />
          </BottomSheetModalProvider>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

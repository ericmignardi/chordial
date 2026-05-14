import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function NotFound() {
  const router = useRouter();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[10px] tracking-[3px] uppercase text-ink-3 font-sans-medium">
          Error 404
        </Text>
        <Text className="mt-2 font-serif text-[36px] leading-none text-ink text-center">
          This page wandered off.
        </Text>
        <Text className="mt-3 text-[14px] leading-[20px] text-ink-2 text-center">
          The screen you were looking for doesn&apos;t exist.
        </Text>
        <View className="mt-7 flex-row">
          <Button size="md" onPress={() => router.replace("/")}>
            Back to Home
          </Button>
        </View>
      </View>
    </Screen>
  );
}

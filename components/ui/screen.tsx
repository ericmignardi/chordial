import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
};

export default function Screen({
  children,
  scroll = false,
  className,
}: ScreenProps) {
  const innerClass = `flex-1 ${className ?? ""}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {scroll ? (
        <ScrollView
          className={innerClass}
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={innerClass}>{children}</View>
      )}
    </SafeAreaView>
  );
}

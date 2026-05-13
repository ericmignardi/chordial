import type { Gear } from "@/hooks/useGear";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

const iconByKind: Record<Gear["kind"], keyof typeof Ionicons.glyphMap> = {
  guitar: "musical-notes-outline",
  bass: "musical-notes-outline",
  amp: "volume-high-outline",
  pedal: "ellipse-outline",
  other: "cube-outline",
};

type GearItemProps = {
  gear: Gear;
  onPress?: () => void;
};

export default function GearItem({ gear, onPress }: GearItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 py-3 active:opacity-60"
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons name={iconByKind[gear.kind]} size={20} color="#374151" />
      </View>
      <View className="flex-1">
        <Text className="text-base">
          <Text className="font-semibold">{gear.brand}</Text>
          <Text className="text-gray-500"> · </Text>
          <Text className="font-serif">{gear.model}</Text>
        </Text>
      </View>
      {gear.year && (
        <Text className="text-gray-500 text-sm">{gear.year}</Text>
      )}
    </Pressable>
  );
}

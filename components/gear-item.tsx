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
      className="flex-row items-center gap-3 py-3.5 border-t border-hair active:opacity-60"
    >
      <View className="w-7 h-7 items-center justify-center">
        <Ionicons name={iconByKind[gear.kind]} size={20} color="#5A5A58" />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] leading-tight text-ink">
          <Text className="font-sans-semibold">{gear.brand}</Text>
          <Text className="text-ink-2"> · </Text>
          <Text className="font-serif-italic">{gear.model}</Text>
        </Text>
      </View>
      {gear.year && (
        <Text className="text-ink-3 text-[13px] tracking-wide">{gear.year}</Text>
      )}
    </Pressable>
  );
}

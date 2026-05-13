import React from "react";
import { Image, Text, View } from "react-native";

type AvatarSize = 32 | 40 | 56 | 96;

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
};

const textSizeByAvatar: Record<AvatarSize, string> = {
  32: "text-sm",
  40: "text-base",
  56: "text-xl",
  96: "text-4xl",
};

export default function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const dimension = { width: size, height: size };
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={dimension}
        className="rounded-full bg-gray-100"
      />
    );
  }

  return (
    <View
      style={dimension}
      className="rounded-full bg-emerald-600 items-center justify-center"
    >
      <Text
        className={`text-white font-serif font-semibold ${textSizeByAvatar[size]}`}
      >
        {initial}
      </Text>
    </View>
  );
}

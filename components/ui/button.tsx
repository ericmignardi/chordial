import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
};

const containerByVariant: Record<Variant, string> = {
  primary: "bg-emerald-600 active:opacity-80",
  secondary: "bg-transparent border border-gray-200 active:opacity-70",
  ghost: "bg-transparent active:opacity-70",
};

const textByVariant: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-gray-900",
  ghost: "text-emerald-600",
};

const containerBySize: Record<Size, string> = {
  sm: "h-9 px-3",
  md: "h-12 px-4",
  lg: "h-14 px-6",
};

const textBySize: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export default function Button({
  children,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isInactive = loading || disabled;
  const spinnerColor = variant === "primary" ? "white" : "#059669";

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      className={`flex justify-center items-center rounded-2xl ${containerBySize[size]} ${containerByVariant[variant]} ${
        isInactive ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View className="flex-row items-center justify-center">
          {typeof children === "string" ? (
            <Text
              className={`font-medium ${textBySize[size]} ${textByVariant[variant]}`}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
}

import React, { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <View className="flex flex-col gap-1.5">
      {label && (
        <Text className="text-[11px] tracking-[1.5px] uppercase font-sans-medium text-ink-2">
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor="#9A9A98"
        className={`focus:outline-none border p-4 rounded-2xl text-ink placeholder:text-ink-3 ${
          error ? "border-red-500" : "border-hair"
        } ${className ?? ""}`}
        {...rest}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
});

export default Input;

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
    <View className="flex flex-col gap-1">
      {label && (
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor="#9CA3AF"
        className={`focus:outline-none border p-4 rounded-2xl placeholder:text-gray-400 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className ?? ""}`}
        {...rest}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
});

export default Input;

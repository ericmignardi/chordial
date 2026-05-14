import React, { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  prefix?: string;
  hint?: string;
};

/**
 * Editorial Classic auth field — uppercase label, a single hairline rule,
 * and the value set large in Fraunces. Used by the sign-in / sign-up /
 * onboarding screens.
 */
const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField(
  { label, prefix, hint, className, ...rest },
  ref,
) {
  return (
    <View>
      <Text className="text-[11px] tracking-[1.5px] uppercase text-ink-2 font-sans-medium mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center gap-1 border-b border-ink py-1">
        {prefix && (
          <Text className="font-serif text-[22px] text-ink-3">{prefix}</Text>
        )}
        <TextInput
          ref={ref}
          placeholderTextColor="#9A9A98"
          className={`flex-1 font-serif text-[22px] text-ink ${className ?? ""}`}
          {...rest}
        />
      </View>
      {hint && <Text className="mt-1.5 text-[12px] text-ink-3">{hint}</Text>}
    </View>
  );
});

export default AuthField;

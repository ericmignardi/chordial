import Screen from "@/components/ui/screen";
import { useCreatePost } from "@/hooks/usePost";
import { toast } from "@/lib/toast";
import { postSchema } from "@/validators/post";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function NewPost() {
  const router = useRouter();
  const createPost = useCreatePost();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setImageUri(null);
    setCaption("");
    setError(null);
    setSubmitting(false);
  }, []);

  const pick = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error("Camera roll permission is required");
      router.back();
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) {
      router.back();
      return;
    }
    setImageUri(result.assets[0].uri);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      reset();
      pick();
    }, [reset, pick]),
  );

  const onShare = async () => {
    if (!imageUri || submitting) return;
    const parsed = postSchema.safeParse({ caption: caption.trim() || null });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createPost.mutateAsync({
        caption: parsed.data.caption ?? null,
        imageUri,
      });
      toast.success("Posted");
      router.replace("/(app)");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not post";
      setError(message);
      setSubmitting(false);
    }
  };

  const onDiscard = () => {
    if (submitting) {
      Alert.alert("Upload in progress", "Wait for the post to finish.");
      return;
    }
    router.back();
  };

  if (!imageUri) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-3">Opening picker…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* header */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-hair">
          <Pressable onPress={onDiscard} disabled={submitting} hitSlop={8}>
            <Text className="text-[15px] text-ink-2">Cancel</Text>
          </Pressable>
          <Text className="text-[13px] font-sans-medium tracking-[1px] uppercase text-ink-2">
            New post
          </Text>
          <Pressable onPress={onShare} disabled={submitting} hitSlop={8}>
            {submitting ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <Text className="text-[15px] font-sans-semibold text-emerald-600">
                Share
              </Text>
            )}
          </Pressable>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 p-4">
            <Image
              source={{ uri: imageUri }}
              className="w-full aspect-square rounded-[2px] bg-gray-100"
            />

            <View className="mt-6 flex-1">
              <Text className="text-[11px] tracking-[1.5px] uppercase text-ink-2 font-sans-medium mb-2">
                Caption
              </Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Say something about it…"
                placeholderTextColor="#9A9A98"
                multiline
                maxLength={500}
                className="font-serif text-[20px] leading-[28px] text-ink min-h-[100px]"
                style={{ textAlignVertical: "top" }}
              />
              <Text className="text-right text-[12px] text-ink-3 mt-2">
                {caption.length} / 500
              </Text>
            </View>

            {error && (
              <Text className="text-red-500 text-center mb-3">{error}</Text>
            )}

            {/* upload status bar */}
            <View className="flex-row items-center gap-3 pt-3 border-t border-hair">
              <Text className="text-[12px] tracking-[1px] uppercase text-ink-2 font-sans-medium">
                {submitting ? "Posting…" : "Ready"}
              </Text>
              <View className="flex-1 h-0.5 bg-hair rounded-full overflow-hidden">
                <View
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: submitting ? "60%" : "100%" }}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

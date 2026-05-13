import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { useCreatePost } from "@/hooks/usePost";
import { toast } from "@/lib/toast";
import { postSchema } from "@/validators/post";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

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
    if (!imageUri) return;
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
          <Text className="text-gray-500">Opening picker...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={onDiscard} disabled={submitting}>
            <Ionicons name="close" size={28} color="#111" />
          </Pressable>
          <Text className="text-xl font-bold">New post</Text>
          <View style={{ width: 28 }} />
        </View>

        <Image
          source={{ uri: imageUri }}
          className="w-full aspect-square rounded-2xl bg-gray-100 mb-4"
        />

        <Input
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          placeholder="Say something about it (optional)"
          multiline
          numberOfLines={4}
        />
        <Text className="text-right text-xs text-gray-400 mt-1 mb-4">
          {caption.length}/500
        </Text>

        <Button onPress={onShare} loading={submitting}>
          Share
        </Button>
        {error && (
          <Text className="text-red-500 text-center mt-2">{error}</Text>
        )}
      </View>
    </Screen>
  );
}

import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { uploadAvatar } from "@/lib/storage";
import { toast } from "@/lib/toast";
import { editProfileSchema } from "@/validators/profile";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
    }
  }, [profile]);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error("Camera roll permission is required");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    const result = editProfileSchema.safeParse({
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      location: location.trim() || null,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      let avatar_url: string | undefined;
      if (avatarUri && session?.user.id) {
        avatar_url = await uploadAvatar(avatarUri, session.user.id);
      }
      await updateProfile.mutateAsync({
        ...result.data,
        ...(avatar_url ? { avatar_url } : {}),
      });
      toast.success("Profile updated");
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View className="px-4">
        <View className="pt-2 pb-6">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#111111" />
          </Pressable>
          <Text className="mt-2 font-serif text-[34px] leading-none text-ink">
            Edit profile
          </Text>
        </View>

        <View className="items-start mb-7">
          <Pressable
            onPress={pickAvatar}
            className="flex-row items-center gap-3.5"
          >
            <Avatar
              uri={avatarUri ?? profile?.avatar_url}
              name={displayName || profile?.username || "?"}
              size={96}
            />
            <Text className="text-emerald-600 font-sans-medium text-[14px]">
              Change photo
            </Text>
          </Pressable>
        </View>

        <View className="flex flex-col gap-5">
          <Input
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
          />
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell players about yourself"
            multiline
            numberOfLines={4}
          />
          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
          />
          <Button onPress={onSave} loading={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
          {error && (
            <Text className="text-red-600 text-center text-[13px]">
              {error}
            </Text>
          )}
        </View>
        <View className="h-8" />
      </View>
    </Screen>
  );
}

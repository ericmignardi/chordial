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
      <View className="p-8">
        <View className="flex-row items-center gap-3 mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#111" />
          </Pressable>
          <Text className="text-3xl font-bold">Edit profile</Text>
        </View>

        <View className="items-center mb-8">
          <Pressable onPress={pickAvatar}>
            <Avatar
              uri={avatarUri ?? profile?.avatar_url}
              name={displayName || profile?.username || "?"}
              size={96}
            />
            <Text className="text-emerald-600 text-center mt-2">
              Change photo
            </Text>
          </Pressable>
        </View>

        <View className="flex flex-col gap-4">
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
            Save changes
          </Button>
          {error && (
            <Text className="text-red-500 text-center">{error}</Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { useUpdateProfile } from "@/hooks/useProfile";
import { uploadAvatar } from "@/lib/storage";
import { toast } from "@/lib/toast";
import { profileSchema } from "@/validators/profile";
import { useAuth } from "@/hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const SLIDES = [
  {
    title: "Show off the guitars you love.",
    subtitle: "Post photos of your instruments. Make your collection visible.",
  },
  {
    title: "Build your Rig.",
    subtitle:
      "Every player has a public, structured list of the gear they own.",
  },
  {
    title: "Follow the players who inspire you.",
    subtitle: "Like, comment, and discover new gear through other players.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { session } = useAuth();
  const updateProfile = useUpdateProfile();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get("window");

  const [page, setPage] = useState(0);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goToPage = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

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

  const onClaim = async () => {
    const result = profileSchema
      .pick({ username: true })
      .safeParse({ username: username.trim().toLowerCase() });
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
        username: result.data.username,
        display_name: displayName.trim() || null,
        ...(avatar_url ? { avatar_url } : {}),
      });
      router.replace("/");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save profile";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyboardShouldPersistTaps="handled"
      >
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{ width }}
            className="flex-1 items-center justify-center p-8"
          >
            <Text className="text-4xl font-bold text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-lg text-gray-600 text-center mb-12">
              {slide.subtitle}
            </Text>
            <Button onPress={() => goToPage(i + 1)}>
              {i === SLIDES.length - 1 ? "Get started" : "Next"}
            </Button>
          </View>
        ))}

        <View style={{ width }} className="flex-1 p-8">
          <Text className="text-3xl font-bold mb-2">Claim your username.</Text>
          <Text className="text-gray-600 mb-8">
            3-20 lowercase letters, numbers, or underscores. This is how other
            players find you.
          </Text>

          <View className="items-center mb-8">
            <Pressable onPress={pickAvatar}>
              <Avatar uri={avatarUri} name={username || "?"} size={96} />
              <Text className="text-emerald-600 text-center mt-2">
                {avatarUri ? "Change photo" : "Add photo"}
              </Text>
            </Pressable>
          </View>

          <View className="flex flex-col gap-4">
            <Input
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase())}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="display name (optional)"
            />
            <Button onPress={onClaim} loading={submitting}>
              Claim
            </Button>
            {error && (
              <Text className="text-red-500 text-center">{error}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-12 left-0 right-0 flex-row justify-center gap-2 pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${
              i === page ? "w-6 bg-emerald-600" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>
    </Screen>
  );
}

import AuthField from "@/components/ui/auth-field";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
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
    eyebrow: "01 — Your collection",
    title: "Show off the guitars you love.",
    subtitle: "Post photos of your instruments. Make your collection visible.",
  },
  {
    eyebrow: "02 — Your rig",
    title: "Build your Rig.",
    subtitle:
      "Every player has a public, structured list of the gear they own.",
  },
  {
    eyebrow: "03 — Your people",
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
          <View key={i} style={{ width }} className="flex-1 justify-center px-7">
            <Text className="text-[10px] tracking-[3px] uppercase text-ink-3 font-sans-medium">
              {slide.eyebrow}
            </Text>
            <Text className="mt-3 font-serif text-[40px] leading-[44px] text-ink">
              {slide.title}
            </Text>
            <Text className="mt-3.5 text-[16px] leading-[24px] text-ink-2">
              {slide.subtitle}
            </Text>
            <View className="mt-9 flex-row">
              <Button onPress={() => goToPage(i + 1)}>
                {i === SLIDES.length - 1 ? "Get started" : "Next"}
              </Button>
            </View>
          </View>
        ))}

        <View style={{ width }} className="flex-1 px-7 pt-16">
          <Text className="text-[10px] tracking-[3px] uppercase text-ink-3 font-sans-medium">
            04 — Claim your handle
          </Text>
          <Text className="mt-3 font-serif text-[36px] leading-none text-ink">
            Claim your username.
          </Text>
          <Text className="mt-3 text-[14px] leading-[20px] text-ink-2">
            3–20 lowercase letters, numbers, or underscores. This is how other
            players find you.
          </Text>

          <View className="mt-7">
            <Pressable onPress={pickAvatar} className="flex-row items-center gap-3.5">
              <Avatar uri={avatarUri} name={username || "?"} size={56} />
              <Text className="text-emerald-600 font-sans-medium text-[14px]">
                {avatarUri ? "Change photo" : "Add photo"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-7 gap-[22px]">
            <AuthField
              label="Username"
              prefix="@"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase())}
              placeholder="yourhandle"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AuthField
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="optional"
            />
          </View>

          <View className="mt-7 flex-row">
            <Button onPress={onClaim} loading={submitting}>
              {submitting ? "Claiming…" : "Claim"}
            </Button>
          </View>
          {error && (
            <Text className="text-red-600 text-[13px] mt-3">{error}</Text>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-12 left-0 right-0 flex-row justify-center gap-2 pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${
              i === page ? "w-6 bg-emerald-600" : "w-1.5 bg-ink-3/40"
            }`}
          />
        ))}
      </View>
    </Screen>
  );
}

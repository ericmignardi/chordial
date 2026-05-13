import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import {
  useDeleteGear,
  useGearItem,
  useUpsertGear,
} from "@/hooks/useGear";
import { toast } from "@/lib/toast";
import { gearKindSchema, gearSchema, type GearKind } from "@/validators/gear";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const KINDS: { value: GearKind; label: string }[] = [
  { value: "guitar", label: "Guitar" },
  { value: "bass", label: "Bass" },
  { value: "amp", label: "Amp" },
  { value: "pedal", label: "Pedal" },
  { value: "other", label: "Other" },
];

export default function GearForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  const { data: existing } = useGearItem(isNew ? undefined : id);
  const upsert = useUpsertGear();
  const remove = useDeleteGear();

  const [kind, setKind] = useState<GearKind>("guitar");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setKind(existing.kind);
      setBrand(existing.brand);
      setModel(existing.model);
      setYear(existing.year ? String(existing.year) : "");
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const onSave = async () => {
    const parsedYear = year.trim() === "" ? null : Number(year);
    const result = gearSchema.safeParse({
      kind,
      brand: brand.trim(),
      model: model.trim(),
      year: parsedYear,
      notes: notes.trim() || null,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await upsert.mutateAsync({
        ...result.data,
        ...(isNew ? {} : { id: id as string }),
      });
      toast.success(isNew ? "Gear added" : "Gear updated");
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save";
      setError(message);
      setSubmitting(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Delete gear?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await remove.mutateAsync(id as string);
            toast.success("Gear deleted");
            router.back();
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "Could not delete";
            toast.error(message);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="p-8">
            <View className="flex-row items-center gap-3 mb-6">
              <Pressable onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="#111" />
              </Pressable>
              <Text className="text-3xl font-bold">
                {isNew ? "Add gear" : "Edit gear"}
              </Text>
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-2">Kind</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {KINDS.map((k) => {
                const active = k.value === kind;
                return (
                  <Pressable
                    key={k.value}
                    onPress={() => setKind(gearKindSchema.parse(k.value))}
                    className={`px-4 py-2 rounded-full border ${
                      active
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={
                        active ? "text-white font-medium" : "text-gray-900"
                      }
                    >
                      {k.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex flex-col gap-4">
              <Input
                label="Brand"
                value={brand}
                onChangeText={setBrand}
                placeholder="Fender"
              />
              <Input
                label="Model"
                value={model}
                onChangeText={setModel}
                placeholder="Stratocaster"
              />
              <Input
                label="Year"
                value={year}
                onChangeText={setYear}
                placeholder="1962"
                keyboardType="number-pad"
              />
              <Input
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything worth remembering"
                multiline
                numberOfLines={4}
              />
              <Button onPress={onSave} loading={submitting}>
                Save
              </Button>
              {error && (
                <Text className="text-red-500 text-center">{error}</Text>
              )}
              {!isNew && (
                <Pressable onPress={onDelete} className="mt-4 py-2">
                  <Text className="text-red-600 text-center font-medium">
                    Delete
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useBlock } from "@/hooks/useBlocks";
import { useReport } from "@/hooks/useReport";
import { toast } from "@/lib/toast";
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

type Mode = "menu" | "report";

export type UserActionsSheetProps = {
  targetUserId: string;
  username?: string | null;
  onBlocked?: () => void;
};

const UserActionsSheet = forwardRef<BottomSheetModal, UserActionsSheetProps>(
  function UserActionsSheet({ targetUserId, username, onBlocked }, ref) {
    const [mode, setMode] = useState<Mode>("menu");
    const [reason, setReason] = useState("");
    const report = useReport();
    const block = useBlock(targetUserId);

    const snapPoints = useMemo(
      () => (mode === "report" ? ["55%"] : ["28%"]),
      [mode],
    );

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const reset = () => {
      setMode("menu");
      setReason("");
    };

    const submitReport = async () => {
      try {
        await report.mutateAsync({
          targetType: "user",
          targetId: targetUserId,
          reason,
        });
        toast.success("Report submitted");
        reset();
        close();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Could not submit report";
        toast.error(message);
      }
    };

    const onBlock = () => {
      Alert.alert(
        "Block user",
        `You won't see posts or comments from @${username ?? "this user"}. They won't see yours either.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            style: "destructive",
            onPress: async () => {
              try {
                await block.mutateAsync();
                toast.success("User blocked");
                close();
                onBlocked?.();
              } catch (e) {
                const message = e instanceof Error ? e.message : "Could not block";
                toast.error(message);
              }
            },
          },
        ],
      );
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={reset}
        backgroundStyle={{ backgroundColor: "#FAFAF7" }}
      >
        <BottomSheetView className="flex-1 px-6 pb-8">
          {mode === "menu" ? (
            <View className="gap-1">
              <Pressable
                onPress={() => setMode("report")}
                className="flex-row items-center gap-4 py-4"
                accessibilityLabel="Report this user"
              >
                <Ionicons name="flag-outline" size={22} color="#5A5A58" />
                <Text className="text-[15px] text-ink">Report user</Text>
              </Pressable>
              <Pressable
                onPress={onBlock}
                className="flex-row items-center gap-4 py-4"
                accessibilityLabel={`Block @${username ?? "user"}`}
              >
                <Ionicons name="ban-outline" size={22} color="#dc2626" />
                <Text className="text-red-600 text-[15px]">
                  Block @{username ?? "user"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4 mt-2">
              <Text className="font-serif text-[22px] text-ink">
                Report user
              </Text>
              <Text className="text-ink-2">
                Tell us what&apos;s wrong. Reports are reviewed in private.
              </Text>
              <Input
                value={reason}
                onChangeText={setReason}
                placeholder="What's the issue?"
                multiline
                numberOfLines={4}
                accessibilityLabel="Reason for reporting"
              />
              <Button
                onPress={submitReport}
                loading={report.isPending}
                disabled={reason.trim().length === 0}
              >
                Submit report
              </Button>
              <Button variant="ghost" size="md" onPress={() => setMode("menu")}>
                Back
              </Button>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default UserActionsSheet;

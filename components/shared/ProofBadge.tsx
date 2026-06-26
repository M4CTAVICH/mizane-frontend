import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "../../constants/tokens";
import ArabicText from "./ArabicText";

interface ProofBadgeProps {
  timestamp?: string;
  onPress?: () => void;
  isPending?: boolean;
}

export default function ProofBadge({ timestamp, onPress, isPending }: ProofBadgeProps) {
  const label = isPending
    ? "قيد التثبيت"
    : timestamp
      ? `تم التثبيت · ${new Date(timestamp).toLocaleDateString("ar-DZ")}`
      : "تم التثبيت";

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <Ionicons
        name="shield-checkmark-outline"
        size={14}
        color={isPending ? colors.textMuted : colors.justiceGold}
      />
      <ArabicText
        size="caption"
        color={isPending ? colors.textMuted : colors.textSecondary}
        style={styles.label}
      >
        {label}
      </ArabicText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.fontMono,
    fontSize: 11,
    letterSpacing: 0.5,
    writingDirection: "ltr",
    textAlign: "left",
  },
});

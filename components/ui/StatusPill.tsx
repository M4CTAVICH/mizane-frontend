import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";

type PillStatus = "valid" | "expiring" | "expired" | "missing" | "unverified";

const STATUS_CONFIG: Record<
  PillStatus,
  { bg: string; text: string; label: string }
> = {
  valid: { bg: colors.safeLight, text: colors.safe, label: "صالح" },
  expiring: { bg: colors.cautionLight, text: colors.caution, label: "ينتهي قريبًا" },
  expired: { bg: colors.dangerLight, text: colors.danger, label: "منتهي" },
  missing: { bg: colors.ink200, text: colors.textMuted, label: "مفقود" },
  unverified: { bg: colors.ink200, text: colors.textMuted, label: "غير موثق" },
};

interface StatusPillProps {
  status: PillStatus;
  label?: string;
}

export default function StatusPill({ status, label }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]}>
      <ArabicText
        size="caption"
        color={config.text}
        weight="medium"
        style={styles.text}
      >
        {label ?? config.label}
      </ArabicText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    textAlign: "center",
  },
});

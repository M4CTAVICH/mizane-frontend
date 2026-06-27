import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";

type PillStatus = "valid" | "expiring" | "expired" | "missing" | "unverified";

const STATUS_CONFIG: Record<
  PillStatus,
  { bg: string; text: string; labelKey: string }
> = {
  valid: { bg: colors.safeLight, text: colors.safe, labelKey: "vault.status.valid" },
  expiring: { bg: colors.cautionLight, text: colors.caution, labelKey: "vault.status.expiring" },
  expired: { bg: colors.dangerLight, text: colors.danger, labelKey: "vault.status.expired" },
  missing: { bg: colors.ink200, text: colors.textMuted, labelKey: "vault.status.missing" },
  unverified: { bg: colors.ink200, text: colors.textMuted, labelKey: "vault.status.unverified" },
};

interface StatusPillProps {
  status: PillStatus;
  label?: string;
}

export default function StatusPill({ status, label }: StatusPillProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]}>
      <ArabicText
        size="caption"
        color={config.text}
        weight="medium"
        style={styles.text}
      >
        {label ?? t(config.labelKey)}
      </ArabicText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ink200, // hairline white/10
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    textAlign: "center",
  },
});

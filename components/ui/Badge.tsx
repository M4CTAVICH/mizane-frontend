import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export default function Badge({
  label,
  color = colors.textSecondary,
  bgColor = colors.ink200,
}: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <ArabicText size="caption" color={color} style={styles.text}>
        {label}
      </ArabicText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ink200, // hairline white/10
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: { textAlign: "center" },
});

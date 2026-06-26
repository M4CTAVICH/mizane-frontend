import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, spacing, shadow } from "../../constants/tokens";

type CardVariant = "default" | "flagged" | "verified";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({
  children,
  variant = "default",
  style,
  padding = spacing.md,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding },
        shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  default: {},
  flagged: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  verified: {
    backgroundColor: colors.safeLight,
    borderColor: colors.safe,
  },
});

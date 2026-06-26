import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../constants/tokens";

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
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface1, // deep absorbent content layer (#0B0B0D)
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink200, // hairline white/10
  },
  default: {},
  flagged: {
    backgroundColor: colors.dangerLight,
    borderColor: "rgba(248,113,113,0.45)",
  },
  verified: {
    backgroundColor: colors.safeLight,
    borderColor: "rgba(45,212,167,0.45)",
  },
});

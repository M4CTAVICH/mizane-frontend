import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radius, spacing } from "../../constants/tokens";

type ContentCardVariant = "default" | "raised" | "flagged" | "verified";

interface ContentCardProps {
  children: React.ReactNode;
  variant?: ContentCardVariant;
  /** NativeWind passthrough. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

/**
 * ContentCard — the CONTENT layer material (Apple HIG).
 *
 * Deep, absorbent dark surfaces for static background cards and data lists.
 * Deliberately NOT blurred: over-blurring the content layer makes the UI
 * visually exhausting and steals emphasis from the functional Liquid Glass.
 *
 * For floating / interactive surfaces use LiquidGlassContainer instead.
 */
export default function ContentCard({
  children,
  variant = "default",
  className,
  style,
  padding = spacing.md,
}: ContentCardProps) {
  return (
    <View className={className} style={[styles.base, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink200, // hairline white/10
    backgroundColor: colors.surface1, // deep absorbent #0B0B0D
  },
  default: {},
  raised: {
    backgroundColor: colors.surface2, // #141417
  },
  flagged: {
    backgroundColor: colors.dangerLight,
    borderColor: "rgba(248,113,113,0.45)",
  },
  verified: {
    backgroundColor: colors.safeLight,
    borderColor: "rgba(45,212,167,0.45)",
  },
});

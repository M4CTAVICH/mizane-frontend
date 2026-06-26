import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { colors, typography } from "../../constants/tokens";

interface ArabicTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  size?: "caption" | "body" | "heading" | "display";
  weight?: "regular" | "medium" | "semibold";
  color?: string;
  align?: "right" | "left" | "center";
  numberOfLines?: number;
}

export default function ArabicText({
  children,
  style,
  size = "body",
  weight = "regular",
  color = colors.textPrimary,
  align = "right",
  numberOfLines,
}: ArabicTextProps) {
  const fontFamily =
    weight === "semibold"
      ? typography.fontArabicSemiBold
      : weight === "medium"
        ? typography.fontArabicMedium
        : typography.fontArabic;

  const fontSize =
    size === "display"
      ? 32
      : size === "heading"
        ? 20
        : size === "caption"
          ? 12
          : 15;

  const lineHeight =
    size === "display" ? 44 : size === "heading" ? 28 : size === "caption" ? 18 : 24;

  return (
    <Text
      style={[
        styles.base,
        { fontFamily, fontSize, lineHeight, color, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    writingDirection: "rtl",
  },
});

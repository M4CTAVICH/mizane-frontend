import React from "react";
import { Text, TextStyle } from "react-native";
import { colors, typography } from "../../constants/tokens";
import { useDirection } from "../../lib/direction";

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
  align,
  numberOfLines,
}: ArabicTextProps) {
  const dir = useDirection();
  // Default to the active language's natural alignment/direction; an explicit
  // `align` prop still wins for intentionally centered/overridden text.
  const resolvedAlign = align ?? dir.textAlign;
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
        { fontFamily, fontSize, lineHeight, color, textAlign: resolvedAlign, writingDirection: dir.writingDirection },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : {},
    isDisabled ? styles.disabled : {},
    style ?? {},
  ];

  const textColor =
    variant === "primary"
      ? colors.inkBlue
      : variant === "secondary"
        ? colors.justiceGold
        : variant === "danger"
          ? colors.danger
          : colors.textSecondary;

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.inkBlue : colors.justiceGold}
        />
      ) : (
        <ArabicText
          weight="medium"
          color={textColor}
          style={[styles.text, styles[`textSize_${size}`], ...(textStyle ? [textStyle] : [])]}
        >
          {children}
        </ArabicText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.5 },

  // Variants
  primary: {
    backgroundColor: colors.justiceGold,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.justiceGold,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },

  // Sizes
  size_sm: { height: 36, paddingHorizontal: spacing.md },
  size_md: { height: 48, paddingHorizontal: spacing.lg },
  size_lg: { height: 56, paddingHorizontal: spacing.xl },

  // Text
  text: { textAlign: "center" },
  textSize_sm: { fontSize: 14 },
  textSize_md: { fontSize: 16 },
  textSize_lg: { fontSize: 18 },
});

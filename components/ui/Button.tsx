import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, shadow } from "../../constants/tokens";
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
    variant === "primary" && !isDisabled ? shadow.gold : {},
    fullWidth ? styles.fullWidth : {},
    isDisabled ? styles.disabled : {},
    style ?? {},
  ];

  const textColor =
    variant === "primary"
      ? colors.inkBlue
      : variant === "danger"
        ? colors.danger
        : colors.textPrimary;

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={[colors.goldGradTop, colors.goldGradBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.inkBlue : colors.textPrimary}
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
    borderRadius: radius.xl,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.5 },

  // Variants
  primary: {
    backgroundColor: colors.gold, // vibrant gold CTA on black
  },
  secondary: {
    // glass / outline white — functional layer hint without full blur
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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

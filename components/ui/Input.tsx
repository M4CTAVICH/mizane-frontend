import React from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { useDirection } from "../../lib/direction";
import ArabicText from "../shared/ArabicText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isArabic?: boolean;
}

export default function Input({
  label,
  error,
  containerStyle,
  isArabic = true,
  style,
  ...props
}: InputProps) {
  const dir = useDirection();
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ArabicText
          size="caption"
          color={colors.textSecondary}
          style={[styles.label, { textAlign: dir.textAlign }]}
        >
          {label}
        </ArabicText>
      ) : null}
      <TextInput
        style={[
          styles.input,
          isArabic && [
            styles.arabicInput,
            { textAlign: dir.textAlign, writingDirection: dir.writingDirection },
          ],
          error ? styles.inputError : {},
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error ? (
        <ArabicText
          size="caption"
          color={colors.danger}
          style={[styles.error, { textAlign: dir.textAlign }]}
        >
          {error}
        </ArabicText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { textAlign: "right" },
  input: {
    height: 48,
    backgroundColor: colors.surface2, // inset active field (#141417)
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200, // hairline white/10
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary, // white vibrancy
    fontFamily: typography.fontLatin,
  },
  arabicInput: {
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: typography.fontArabic,
  },
  inputError: { borderColor: colors.danger },
  error: { textAlign: "right" },
});

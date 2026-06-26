import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";
import type { Citation } from "../../store/assistantStore";

interface CitationCardProps {
  citation: Citation;
  onPress?: () => void;
}

export default function CitationCard({ citation, onPress }: CitationCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Ionicons name="library-outline" size={14} color={colors.justiceGold} />
        <ArabicText
          size="caption"
          weight="medium"
          color={colors.justiceGold}
          style={styles.ref}
        >
          {citation.article} · {citation.law}
        </ArabicText>
        <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
      </View>
      <ArabicText size="caption" color={colors.ink300} style={styles.text}>
        "{citation.text}"
      </ArabicText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderRightWidth: 3,
    borderRightColor: colors.justiceGold,
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
  },
  ref: {
    fontFamily: typography.fontMono,
    flex: 1,
    textAlign: "right",
  },
  text: {
    fontFamily: typography.fontArabic,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right",
    writingDirection: "rtl",
    fontStyle: "italic",
  },
});

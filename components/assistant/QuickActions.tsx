import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../constants/tokens";
import { ORB_IMAGE } from "../../constants/assets";
import ArabicText from "../shared/ArabicText";

// Suggested opening prompts. Each one is sent verbatim into the assistant.
const SUGGESTIONS = [
  "افحص صلاحية وثيقة لديّ",
  "ما هي حقوقي كمستأجر؟",
  "ساعدني في صياغة شكوى عمل",
  "اشرح خطوات تجديد الإقامة",
] as const;

interface QuickActionsProps {
  onActionPress: (message: string) => void;
}

export default function QuickActions({ onActionPress }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      {/* Hero orb with a soft gold halo */}
      <View style={styles.orbWrap}>
        <Image source={ORB_IMAGE} style={styles.orb} resizeMode="cover" />
      </View>

      <ArabicText
        size="heading"
        weight="semibold"
        color={colors.textPrimary}
        align="center"
        style={styles.greeting}
      >
        مرحباً، كيف يمكنني مساعدتك؟
      </ArabicText>
      <ArabicText
        size="caption"
        color={colors.textMuted}
        align="center"
        style={styles.subtitle}
      >
        مساعدك القانوني الخاص، يجيب بسرية تامة على كل ما يخص وثائقك وحقوقك.
      </ArabicText>

      <View style={styles.list}>
        {SUGGESTIONS.map((text) => (
          <TouchableOpacity
            key={text}
            style={styles.pill}
            onPress={() => onActionPress(text)}
            activeOpacity={0.75}
          >
            <ArabicText weight="medium" color={colors.textPrimary} style={styles.pillText}>
              {text}
            </ArabicText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    alignItems: "center",
  },
  orbWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    // Soft gold glow around the orb.
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 0,
  },
  orb: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  greeting: {
    fontSize: 22,
    lineHeight: 33,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
    marginTop: spacing.sm,
  },
  list: {
    alignSelf: "stretch",
    gap: 10,
    marginTop: spacing.xl,
  },
  pill: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFill,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pillText: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "right",
  },
});

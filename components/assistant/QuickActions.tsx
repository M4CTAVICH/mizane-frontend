import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius, shadow, spacing } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";

const QUICK_ACTIONS = [
  {
    id: "scan",
    icon: "document-text-outline",
    label: "افحص وثيقة",
    sublabel: "Scanner",
    route: "/scan",
  },
  {
    id: "rights",
    icon: "scale-outline",
    label: "ما هي حقوقي؟",
    sublabel: "Rights Q&A",
    message: "ما هي حقوقي القانونية في الجزائر؟",
  },
  {
    id: "procedure",
    icon: "list-outline",
    label: "اتبع إجراءً",
    sublabel: "Procedures",
    route: "/(tabs)/procedures",
  },
  {
    id: "letter",
    icon: "mail-outline",
    label: "اكتب رسالة",
    sublabel: "Letter Generator",
    route: "/letter/labor_complaint",
  },
] as const;

interface QuickActionsProps {
  onActionPress: (message: string) => void;
}

export default function QuickActions({ onActionPress }: QuickActionsProps) {
  const router = useRouter();

  const handlePress = (action: (typeof QUICK_ACTIONS)[number]) => {
    if ("route" in action && action.route) {
      router.push(action.route as any);
    } else if ("message" in action && action.message) {
      onActionPress(action.message);
    }
  };

  return (
    <View style={styles.container}>
      <ArabicText
        size="heading"
        weight="semibold"
        color={colors.textPrimary}
        style={styles.greeting}
      >
        مرحباً، كيف يمكنني مساعدتك؟
      </ArabicText>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.card}
            onPress={() => handlePress(action)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={action.icon as any} size={24} color={colors.justiceGold} />
            </View>
            <ArabicText weight="medium" color={colors.textPrimary} style={styles.label}>
              {action.label}
            </ArabicText>
            <ArabicText size="caption" color={colors.textMuted} style={styles.sublabel}>
              {action.sublabel}
            </ArabicText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  greeting: {
    textAlign: "right",
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "48%",
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ink200,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.justiceGold}15`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  label: { fontSize: 14, textAlign: "right" },
  sublabel: { textAlign: "right" },
});

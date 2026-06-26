import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";

export interface DNACheck {
  id: string;
  label: string;
  passed: boolean;
}

interface DNAResultProps {
  checks: DNACheck[];
  authentic: boolean;
}

export default function DNAResult({ checks, authentic }: DNAResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={authentic ? "checkmark-circle" : "warning"}
          size={20}
          color={authentic ? colors.safe : colors.caution}
        />
        <ArabicText weight="medium" color={authentic ? colors.safe : colors.caution}>
          {authentic ? "الوثيقة تبدو أصلية" : "بعض العناصر مفقودة"}
        </ArabicText>
      </View>
      <View style={styles.checks}>
        {checks.map((check) => (
          <View key={check.id} style={styles.checkRow}>
            <ArabicText
              size="caption"
              color={check.passed ? colors.safe : colors.caution}
              style={styles.checkLabel}
            >
              {check.label}
            </ArabicText>
            <Ionicons
              name={check.passed ? "checkmark-circle" : "alert-circle-outline"}
              size={16}
              color={check.passed ? colors.safe : colors.caution}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  checks: { gap: spacing.xs },
  checkRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  checkLabel: { textAlign: "right", flex: 1 },
});

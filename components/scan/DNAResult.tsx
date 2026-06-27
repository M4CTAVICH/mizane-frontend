import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/tokens";
import { useDirection } from "../../lib/direction";
import ArabicText from "../shared/ArabicText";
import ContentCard from "../ui/ContentCard";

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
  const { t } = useTranslation();
  const dir = useDirection();
  return (
    <ContentCard variant={authentic ? "verified" : "flagged"} style={styles.container}>
      <View style={[styles.header, { flexDirection: dir.row }]}>
        <Ionicons
          name={authentic ? "checkmark-circle" : "warning"}
          size={20}
          color={authentic ? colors.safe : colors.caution}
        />
        <ArabicText weight="medium" color={authentic ? colors.safe : colors.caution}>
          {authentic ? t("scan.authentic") : t("scan.elements_missing")}
        </ArabicText>
      </View>
      <View style={styles.checks}>
        {checks.map((check) => (
          <View key={check.id} style={[styles.checkRow, { flexDirection: dir.row }]}>
            <ArabicText
              size="caption"
              color={check.passed ? colors.safe : colors.caution}
              style={[styles.checkLabel, { textAlign: dir.textAlign }]}
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
    </ContentCard>
  );
}

const styles = StyleSheet.create({
  container: {
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

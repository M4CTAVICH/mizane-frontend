import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../constants/tokens";
import { useDirection } from "../../lib/direction";
import ArabicText from "../shared/ArabicText";
import ContentCard from "../ui/ContentCard";
import type { Citation } from "../../store/assistantStore";

interface CitationCardProps {
  citation: Citation;
  onPress?: () => void;
}

export default function CitationCard({ citation, onPress }: CitationCardProps) {
  const dir = useDirection();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrap}>
      <ContentCard padding={spacing.sm} style={styles.container}>
        <View style={[styles.header, { flexDirection: dir.row }]}>
          <Ionicons name="library-outline" size={14} color={colors.gold} />
          <ArabicText
            size="caption"
            weight="medium"
            color={colors.gold}
            style={[styles.ref, { textAlign: dir.textAlign }]}
          >
            {citation.article} · {citation.law}
          </ArabicText>
          <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
        </View>
        <ArabicText
          size="caption"
          color={colors.textSecondary}
          style={[
            styles.text,
            { textAlign: dir.textAlign, writingDirection: dir.writingDirection },
          ]}
        >
          "{citation.text}"
        </ArabicText>
      </ContentCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
  },
  container: {
    borderRightWidth: 3,
    borderRightColor: colors.gold, // gold article-ref accent edge
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

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography, textScale } from "../../constants/tokens";
import { PROCEDURES } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";
import ContentCard from "../../components/ui/ContentCard";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "housing", label: "السكن" },
  { id: "labor", label: "العمل" },
  { id: "family", label: "الأسرة" },
  { id: "documents", label: "الوثائق" },
] as const;

export default function ProceduresScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? PROCEDURES
      : PROCEDURES.filter((p) => p.category === filter);

  return (
    <View style={styles.container}>
      {/* ── Glass header (functional layer) ───────────────────────── */}
      <View style={styles.header}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]} />
        <LinearGradient
          colors={[colors.glassHighlight, "rgba(255,255,255,0.03)", "transparent"]}
          locations={[0, 0.4, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.headerRow}>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={textScale.label}>MIZANE · PROCEDURES</Text>
            <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
              الإجراءات
            </ArabicText>
          </View>
        </View>
        <View style={styles.headerHairline} />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.chip, filter === f.id && styles.chipActive]}
            onPress={() => setFilter(f.id)}
            activeOpacity={0.8}
          >
            <ArabicText
              size="caption"
              weight={filter === f.id ? "medium" : "regular"}
              color={filter === f.id ? colors.inkBlue : colors.textSecondary}
            >
              {f.label}
            </ArabicText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Procedure cards (content layer) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/procedure/${item.id}`)}
            activeOpacity={0.85}
          >
            <ContentCard variant="raised" style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconBg}>
                  <Ionicons name={item.icon as any} size={22} color={colors.gold} />
                </View>
                <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
              </View>
              <ArabicText
                weight="semibold"
                color={colors.textPrimary}
                style={styles.cardTitle}
              >
                {item.label}
              </ArabicText>
              <ArabicText
                size="caption"
                color={colors.textMuted}
                style={styles.cardSub}
              >
                {item.labelFr}
              </ArabicText>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                  <ArabicText size="caption" color={colors.textMuted}>
                    {item.duration}
                  </ArabicText>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="list-outline" size={13} color={colors.textMuted} />
                  <ArabicText size="caption" color={colors.textMuted}>
                    {item.steps.length} خطوات
                  </ArabicText>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="document-outline" size={13} color={colors.textMuted} />
                  <ArabicText size="caption" color={colors.textMuted}>
                    {item.requiredDocs.length} وثائق
                  </ArabicText>
                </View>
              </View>
            </ContentCard>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  // Glass header
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: "hidden",
  },
  headerRow: { alignItems: "flex-end" },
  headerHairline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassBorder,
  },

  filterScroll: {
    maxHeight: 48,
    backgroundColor: "transparent",
  },
  filters: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: "row-reverse",
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 120, // clear the floating glass tab bar
  },
  card: {
    gap: spacing.xs,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.gold}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { textAlign: "right", fontSize: 17 },
  cardSub: { textAlign: "right", fontFamily: typography.fontLatin },
  cardMeta: {
    flexDirection: "row-reverse",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
});

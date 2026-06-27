import React, { useState } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { PROCEDURES } from "../../constants/tokens";
import { PROCEDURE_IMAGES } from "../../constants/assets";
import ArabicText from "../../components/shared/ArabicText";
import { useDirection } from "../../lib/direction";

const FILTERS = [
  { id: "all", labelKey: "procedures.filter.all" },
  { id: "housing", labelKey: "procedures.filter.housing" },
  { id: "labor", labelKey: "procedures.filter.labor" },
  { id: "family", labelKey: "procedures.filter.family" },
  { id: "documents", labelKey: "procedures.filter.documents" },
] as const;

// Category → the i18n key for the short tag shown on each card.
const CATEGORY_LABEL_KEY: Record<string, string> = {
  labor: "procedures.filter.labor",
  documents: "procedures.filter.documents",
  family: "procedures.filter.family",
  housing: "procedures.filter.housing",
};

function toArabicDigits(value: string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return value.replace(/[0-9]/g, (d) => map[Number(d)]);
}

export default function ProceduresScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dir = useDirection();
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? PROCEDURES
      : PROCEDURES.filter((p) => p.category === filter);

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={[styles.headerWrap, { alignItems: dir.alignStart }]}>
        <ArabicText weight="semibold" color={colors.textPrimary} style={styles.title}>
          {t("procedures.title")}
        </ArabicText>
        <ArabicText size="caption" color={colors.textMuted} style={styles.subtitle}>
          {t("procedures.subtitle")}
        </ArabicText>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filters, { flexDirection: dir.row }]}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.8}
            >
              <ArabicText
                size="caption"
                weight="semibold"
                color={active ? colors.inkBlue : colors.textMuted}
              >
                {t(f.labelKey)}
              </ArabicText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Procedure cards */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const meta = toArabicDigits(
            `${t("proc." + item.id + ".duration")} · ${t("procedures.steps", {
              count: item.steps.length,
            })} · ${t("procedures.docs", { count: item.requiredDocs.length })}`
          );
          return (
            <TouchableOpacity
              onPress={() => router.push(`/procedure/${item.id}`)}
              activeOpacity={0.85}
              style={styles.card}
            >
              {/* Cover art with a fade into the card body */}
              <View style={styles.coverWrap}>
                <Image
                  source={PROCEDURE_IMAGES[item.id]}
                  style={styles.cover}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["rgba(5,5,6,0)", "rgba(5,5,6,0.85)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>

              {/* Content (right-aligned) */}
              <View style={[styles.content, { alignItems: dir.alignStart }]}>
                <View style={styles.catTag}>
                  <ArabicText
                    size="caption"
                    weight="semibold"
                    color={colors.gold}
                    style={styles.catTagText}
                  >
                    {CATEGORY_LABEL_KEY[item.category]
                      ? t(CATEGORY_LABEL_KEY[item.category])
                      : ""}
                  </ArabicText>
                </View>
                <ArabicText
                  weight="semibold"
                  color={colors.textPrimary}
                  style={[styles.cardTitle, { textAlign: dir.textAlign }]}
                  numberOfLines={1}
                >
                  {t("proc." + item.id + ".title")}
                </ArabicText>
                <ArabicText color={colors.goldDeep} style={[styles.cardSub, { textAlign: dir.textAlign }]} numberOfLines={1}>
                  {dir.isRTL ? item.labelFr : item.label}
                </ArabicText>
                <ArabicText size="caption" color={colors.textMuted} style={[styles.cardMeta, { textAlign: dir.textAlign }]}>
                  {meta}
                </ArabicText>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  // Header
  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: "flex-end",
  },
  title: { fontSize: 28, lineHeight: 42 },
  subtitle: { fontSize: 13.5, lineHeight: 20, marginTop: 2 },

  filterScroll: { maxHeight: 52, backgroundColor: "transparent" },
  filters: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: "row-reverse",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.glassFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 14,
    paddingBottom: 120, // clear the floating glass tab bar
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 136,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFill,
  },
  coverWrap: { width: 96, alignSelf: "stretch" },
  cover: { width: "100%", height: "100%" },
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  catTag: {
    backgroundColor: `${colors.gold}1F`,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  catTagText: { fontSize: 11, lineHeight: 16 },
  cardTitle: { fontSize: 17, lineHeight: 26, textAlign: "right", marginTop: spacing.sm },
  cardSub: {
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "right",
    fontFamily: typography.fontLatin,
    marginTop: 1,
  },
  cardMeta: { fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: spacing.sm },
});

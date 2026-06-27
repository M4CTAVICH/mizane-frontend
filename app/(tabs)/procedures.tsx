import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { proceduresApi } from "../../lib/api";
import { PROCEDURE_FILTERS, PROCEDURE_META } from "../../constants/procedureMeta";
import ArabicText from "../../components/shared/ArabicText";
import { useDirection } from "../../lib/direction";
import type { ProcedureDto } from "../../types/api";

// Category → the i18n key for the localized filter chip label.
const CATEGORY_LABEL_KEY: Record<string, string> = {
  all: "procedures.filter.all",
  housing: "procedures.filter.housing",
  labor: "procedures.filter.labor",
  family: "procedures.filter.family",
  documents: "procedures.filter.documents",
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
  const [catalog, setCatalog] = useState<ProcedureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    proceduresApi
      .catalog()
      .then((rows) => setCatalog(rows))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === "all"
      ? catalog
      : catalog.filter((p) => PROCEDURE_META[p.key]?.category === filter);

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
        {PROCEDURE_FILTERS.map((f) => {
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
                {CATEGORY_LABEL_KEY[f.id] ? t(CATEGORY_LABEL_KEY[f.id]) : f.label}
              </ArabicText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Procedure cards */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.ink300} />
              <ArabicText color={colors.textMuted}>تعذّر تحميل الإجراءات</ArabicText>
              <TouchableOpacity onPress={load} hitSlop={8}>
                <ArabicText weight="semibold" color={colors.gold}>{t("common.retry")}</ArabicText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stateBox}>
              <ArabicText color={colors.textMuted}>لا توجد إجراءات</ArabicText>
            </View>
          )
        }
        renderItem={({ item }) => {
          const m = PROCEDURE_META[item.key];
          const stepCount = item.steps?.length ?? 0;
          const docCount = item.requiredDocTypes?.length ?? 0;
          const meta = toArabicDigits(
            `${m?.duration ?? ""} · ${t("procedures.steps", { count: stepCount })} · ${t("procedures.docs", { count: docCount })}`,
          );
          return (
            <TouchableOpacity
              onPress={() => router.push(`/procedure/${item.key}`)}
              activeOpacity={0.85}
              style={styles.card}
            >
              {/* Cover art with a fade into the card body */}
              <View style={styles.coverWrap}>
                <Image source={m?.image} style={styles.cover} resizeMode="cover" />
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
                    {m?.categoryLabel ?? ""}
                  </ArabicText>
                </View>
                <ArabicText
                  weight="semibold"
                  color={colors.textPrimary}
                  style={[styles.cardTitle, { textAlign: dir.textAlign }]}
                  numberOfLines={1}
                >
                  {(dir.isRTL ? item.title?.ar : item.title?.fr) ?? item.key}
                </ArabicText>
                <ArabicText color={colors.goldDeep} style={[styles.cardSub, { textAlign: dir.textAlign }]} numberOfLines={1}>
                  {(dir.isRTL ? item.title?.fr : item.title?.ar) ?? ""}
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
  stateBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },

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

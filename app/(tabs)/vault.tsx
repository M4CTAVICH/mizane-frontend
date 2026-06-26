import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, typography, textScale } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import { VAULT_HERO_IMAGE } from "../../constants/assets";
import ArabicText from "../../components/shared/ArabicText";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import DocumentCard from "../../components/vault/DocumentCard";

// Western digits → Arabic-Indic, so metrics read natively in the RTL layout.
function toArabicDigits(value: number | string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value).replace(/[0-9]/g, (d) => map[Number(d)]);
}

interface SummaryTagProps {
  count: number;
  label: string;
  color: string;
}

function SummaryTag({ count, label, color }: SummaryTagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}1F` }]}>
      <ArabicText size="caption" weight="semibold" color={color} style={styles.tagText}>
        {`${toArabicDigits(count)} ${label}`}
      </ArabicText>
    </View>
  );
}

export default function VaultScreen() {
  const documents = useVaultStore((s) => s.documents);
  const [search, setSearch] = useState("");

  const filtered = documents.filter(
    (d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.type.includes(search)
  );

  const valid = documents.filter((d) => d.status === "valid").length;
  const expiring = documents.filter((d) => d.status === "expiring").length;
  const expired = documents.filter((d) => d.status === "expired").length;

  const listHeader = (
    <View>
      {/* Hero summary metric over a marble backdrop */}
      <View style={styles.hero}>
        <ImageBackground
          source={VAULT_HERO_IMAGE}
          style={styles.heroBg}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={["rgba(5,5,6,0.55)", "rgba(5,5,6,0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <ArabicText size="caption" color={colors.textMuted} style={styles.heroLabel}>
              إجمالي الوثائق المحفوظة
            </ArabicText>
            <Text style={styles.heroMetric}>{toArabicDigits(documents.length)}</Text>
            <View style={styles.heroTags}>
              <SummaryTag count={valid} label="صالح" color={colors.safe} />
              <SummaryTag count={expiring} label="ينتهي" color={colors.caution} />
              <SummaryTag count={expired} label="منتهٍ" color={colors.danger} />
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Search — active input field → Liquid Glass (functional layer) */}
      <View style={styles.searchWrap}>
        <LiquidGlassContainer radius={radius.md} padding={0} intensity={40}>
          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="ابحث عن وثيقة..."
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </LiquidGlassContainer>
      </View>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity hitSlop={8} activeOpacity={0.7}>
          <ArabicText size="caption" weight="semibold" color={colors.gold}>
            عرض الكل
          </ArabicText>
        </TouchableOpacity>
        <ArabicText weight="semibold" color={colors.textPrimary} style={styles.sectionTitle}>
          الوثائق الأخيرة
        </ArabicText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header (title + gold add action) ─────────────────────── */}
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.goldGradTop, colors.goldGradBottom]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="add" size={24} color={colors.inkBlue} />
          </TouchableOpacity>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={textScale.label}>VAULT</Text>
            <ArabicText
              weight="semibold"
              color={colors.textPrimary}
              style={styles.headerTitle}
            >
              خزينتي
            </ArabicText>
          </View>
        </View>
      </View>

      {/* Document list (transparent canvas) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => <DocumentCard document={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.ink300} />
            <ArabicText color={colors.textMuted} style={{ textAlign: "center" }}>
              لا توجد وثائق. ابدأ بإضافة وثيقة.
            </ArabicText>
          </View>
        }
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
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 28, lineHeight: 40 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero metric
  hero: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  heroBg: { width: "100%", minHeight: 148, justifyContent: "flex-end" },
  heroImage: { resizeMode: "cover" },
  heroContent: {
    padding: spacing.md,
    alignItems: "flex-end",
  },
  heroLabel: { fontSize: 12.5 },
  heroMetric: {
    ...textScale.superMetric,
    fontSize: 44,
    lineHeight: 50,
    marginTop: spacing.xs,
  },
  heroTags: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, lineHeight: 16 },

  // Search
  searchWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: { opacity: 0.6 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontFamily: typography.fontArabic,
    color: colors.textPrimary,
    textAlign: "right",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 17 },

  list: { flex: 1, backgroundColor: "transparent" },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120, // clear the floating glass tab bar
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
});

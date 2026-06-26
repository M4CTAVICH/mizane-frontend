import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, textScale } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import ArabicText from "../../components/shared/ArabicText";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import DocumentCard from "../../components/vault/DocumentCard";
import StatusPill from "../../components/ui/StatusPill";

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
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={24} color={colors.gold} />
          </TouchableOpacity>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={textScale.label}>VAULT</Text>
            <ArabicText
              size="heading"
              weight="semibold"
              color={colors.textPrimary}
              style={styles.headerTitle}
            >
              خزينتي
            </ArabicText>
          </View>
        </View>
        <View style={styles.headerHairline} />
      </View>

      {/* Status summary (transparent — fluid mesh shows through) */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <StatusPill status="valid" label={`صالح · ${valid}`} />
        </View>
        <View style={styles.summaryItem}>
          <StatusPill status="expiring" label={`ينتهي · ${expiring}`} />
        </View>
        <View style={styles.summaryItem}>
          <StatusPill status="expired" label={`منتهي · ${expired}`} />
        </View>
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

      {/* Document list (transparent canvas) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

  // Glass header
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, lineHeight: 30 },
  headerHairline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassBorder,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryBar: {
    flexDirection: "row-reverse",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  summaryItem: {},

  searchWrap: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
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
  },

  list: { flex: 1, backgroundColor: "transparent" },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 120, // clear the floating glass tab bar
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
});

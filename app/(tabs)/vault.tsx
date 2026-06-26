import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import ArabicText from "../../components/shared/ArabicText";
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.justiceGold} />
        </TouchableOpacity>
        <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
          خزينتي
        </ArabicText>
      </View>

      {/* Status summary */}
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

      {/* Search */}
      <View style={styles.searchContainer}>
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

      {/* Document list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.justiceGold,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBar: {
    flexDirection: "row-reverse",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  summaryItem: {},
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.surface1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200,
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
});

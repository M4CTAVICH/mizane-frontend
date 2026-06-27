import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { colors, spacing, radius, typography, textScale } from "../../constants/tokens";
import { DocumentType as DOC_TOKENS, type DocumentTypeKey } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import { documentsApi } from "../../lib/api";
import { toApiDocType, toStoreDocument } from "../../lib/mappers";
import { VAULT_HERO_IMAGE } from "../../constants/assets";
import ArabicText from "../../components/shared/ArabicText";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import DocumentCard from "../../components/vault/DocumentCard";

type PickedFile = { uri: string; name: string; mimeType: string };
const DOC_TYPE_KEYS = Object.keys(DOC_TOKENS) as DocumentTypeKey[];

interface SummaryTagProps {
  count: number;
  label: string;
  color: string;
}

function SummaryTag({ count, label, color }: SummaryTagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}1F` }]}>
      <ArabicText size="caption" weight="semibold" color={color} style={styles.tagText}>
        {`${count} ${label}`}
      </ArabicText>
    </View>
  );
}

export default function VaultScreen() {
  const documents = useVaultStore((s) => s.documents);
  const setDocuments = useVaultStore((s) => s.setDocuments);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [typeSheet, setTypeSheet] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const docs = await documentsApi.list();
      setDocuments(docs.map(toStoreDocument));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setDocuments]);

  useEffect(() => {
    load();
  }, [load]);

  // Pick a file, then ask for its type before uploading.
  const handleAdd = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setPicked({
      uri: a.uri,
      name: a.name ?? "document",
      mimeType: a.mimeType ?? "application/octet-stream",
    });
    setTypeSheet(true);
  };

  const handleUpload = async (typeKey: DocumentTypeKey) => {
    if (!picked) return;
    setUploading(true);
    try {
      const formData = new FormData();
      if (Platform.OS === "web") {
        // On web, FormData needs a real Blob/File; the {uri,name,type} object
        // would be stringified to "[object Object]" and rejected by the API.
        const blob = await (await fetch(picked.uri)).blob();
        formData.append("file", blob, picked.name);
      } else {
        formData.append("file", {
          uri: picked.uri,
          name: picked.name,
          type: picked.mimeType,
        } as any);
      }
      formData.append("type", toApiDocType(typeKey));
      await documentsApi.upload(formData);
      setTypeSheet(false);
      setPicked(null);
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.status === 401
          ? "انتهت الجلسة. سجّل الدخول من جديد."
          : "تعذّر رفع الوثيقة. حاول مجددًا.";
      Alert.alert("خطأ", msg);
    } finally {
      setUploading(false);
    }
  };

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
            <Text style={styles.heroMetric}>{documents.length}</Text>
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
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={handleAdd}>
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
        refreshing={loading && documents.length > 0}
        onRefresh={load}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.ink300} />
              <ArabicText color={colors.textMuted} style={{ textAlign: "center" }}>
                تعذّر تحميل الوثائق
              </ArabicText>
              <TouchableOpacity onPress={load} hitSlop={8}>
                <ArabicText weight="semibold" color={colors.gold}>إعادة المحاولة</ArabicText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={colors.ink300} />
              <ArabicText color={colors.textMuted} style={{ textAlign: "center" }}>
                لا توجد وثائق. ابدأ بإضافة وثيقة.
              </ArabicText>
            </View>
          )
        }
      />

      {/* Document-type picker — an in-screen overlay (not a Modal) so it can't
          flicker when it mounts right after the native document picker closes. */}
      {typeSheet && (
        <View style={styles.pickerOverlay}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => {
              if (!uploading) {
                setTypeSheet(false);
                setPicked(null);
              }
            }}
          />
          <View style={styles.pickerCard}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
                نوع الوثيقة
              </ArabicText>
              {!uploading && (
                <TouchableOpacity
                  onPress={() => {
                    setTypeSheet(false);
                    setPicked(null);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {uploading ? (
              <View style={styles.uploadingBox}>
                <ActivityIndicator color={colors.gold} />
                <ArabicText color={colors.textMuted}>جارٍ رفع الوثيقة...</ArabicText>
              </View>
            ) : (
              <ScrollView
                style={styles.typeScroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {DOC_TYPE_KEYS.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.typeRow}
                    activeOpacity={0.7}
                    onPress={() => handleUpload(key)}
                  >
                    <Ionicons
                      name={DOC_TOKENS[key].icon as any}
                      size={20}
                      color={colors.gold}
                    />
                    <ArabicText weight="medium" color={colors.textPrimary} style={styles.typeLabel}>
                      {DOC_TOKENS[key].label}
                    </ArabicText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}
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
  // Inline type-picker overlay
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
    elevation: 100,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  pickerCard: {
    backgroundColor: colors.surface1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: "75%",
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink300,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  pickerHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  uploadingBox: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  typeScroll: { marginTop: spacing.xs },
  typeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  typeLabel: { fontSize: 16, flex: 1, textAlign: "right" },
});

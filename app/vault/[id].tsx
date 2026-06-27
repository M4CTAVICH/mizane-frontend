import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing } from "../../constants/tokens";
import { useVaultStore, type VaultDocument } from "../../store/vaultStore";
import { DOC_THUMBNAILS, DOC_THUMBNAIL_FALLBACK } from "../../constants/assets";
import ArabicText from "../../components/shared/ArabicText";
import Button from "../../components/ui/Button";
import { mockAnchor } from "../../lib/proof";
import { useDirection } from "../../lib/direction";

type Status = VaultDocument["status"];

const STATUS_TAG: Record<Status, { labelKey: string; color: string }> = {
  valid: { labelKey: "vault.status.valid", color: "#5FB38A" },
  expiring: { labelKey: "vault.status.expiring", color: colors.caution },
  expired: { labelKey: "vault.status.expired", color: colors.danger },
  missing: { labelKey: "vault.status.missing", color: colors.textMuted },
  unverified: { labelKey: "vault.status.unverified", color: colors.textMuted },
};

/** Format an ISO date string as YYYY/M/D (Gregorian, no leading zeros). */
function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function InfoRow({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  const dir = useDirection();
  return (
    <View style={[styles.infoRow, divider && styles.infoRowDivider, { flexDirection: dir.row }]}>
      <ArabicText weight="medium" color={colors.textPrimary} style={styles.infoValue}>
        {value}
      </ArabicText>
      <ArabicText color={colors.textMuted} style={styles.infoLabel}>
        {label}
      </ArabicText>
    </View>
  );
}

export default function DocumentDetailScreen() {
  const { t } = useTranslation();
  const dir = useDirection();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { documents, updateDocument } = useVaultStore();
  const [anchoring, setAnchoring] = useState(false);

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <ArabicText color={colors.textMuted}>{t("vault.not_found")}</ArabicText>
          <Button variant="ghost" onPress={() => router.back()}>
            {t("vault.back")}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const tag = STATUS_TAG[doc.status];
  const expiry = formatDate(doc.expiresAt);
  const securedDate = formatDate(doc.createdAt);
  const isAnchored = Boolean(doc.anchorRef);
  const heroImage = DOC_THUMBNAILS[doc.type] ?? DOC_THUMBNAIL_FALLBACK;

  const statusValue =
    doc.status === "valid" && expiry ? t("vault.valid_until", { date: expiry }) : t(tag.labelKey);

  const handleAnchor = async () => {
    setAnchoring(true);
    await new Promise((r) => setTimeout(r, 1500));
    const proof = mockAnchor(doc.id);
    updateDocument(doc.id, { anchorRef: proof.anchorRef });
    setAnchoring(false);
    Alert.alert(t("vault.anchored_title"), t("vault.anchor_ref", { ref: proof.anchorRef }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — circular glass back button + centered title */}
      <View style={[styles.header, { flexDirection: dir.row }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-forward" size={19} color={colors.textPrimary} />
        </TouchableOpacity>
        <ArabicText weight="semibold" color={colors.textPrimary} numberOfLines={1} style={styles.headerTitle}>
          {t("doctype." + doc.type)}
        </ArabicText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image card */}
        <View style={styles.hero}>
          <Image source={heroImage} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(5,5,6,0.1)", "rgba(5,5,6,0.55)", "rgba(5,5,6,0.96)"]}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroContent, { alignItems: dir.alignStart }]}>
            <View style={[styles.statusTag, { backgroundColor: `${tag.color}1F` }]}>
              <ArabicText weight="semibold" color={tag.color} style={styles.statusTagText}>
                {t(tag.labelKey)}
              </ArabicText>
            </View>
            <ArabicText weight="semibold" color={colors.textPrimary} style={[styles.heroTitle, { textAlign: dir.textAlign }]}>
              {t("doctype." + doc.type)}
            </ArabicText>
            <View style={[styles.heroMetaRow, { flexDirection: dir.row }]}>
              <ArabicText color={colors.textMuted} style={styles.heroMeta}>
                {isAnchored && securedDate
                  ? t("vault.secured_on", { date: securedDate })
                  : t("vault.not_secured")}
              </ArabicText>
              {isAnchored ? (
                <Ionicons name="shield-checkmark" size={13} color="#5FB38A" />
              ) : null}
            </View>
          </View>
        </View>

        {/* Expiry highlight */}
        {expiry ? (
          <View style={[styles.expiryCard, { flexDirection: dir.row }]}>
            <ArabicText weight="semibold" color={colors.textPrimary} style={styles.expiryDate}>
              {expiry}
            </ArabicText>
            <ArabicText color={colors.textMuted} style={styles.expiryLabel}>
              {t("vault.expires")}
            </ArabicText>
          </View>
        ) : null}

        {/* Info card */}
        <View style={styles.infoCard}>
          <InfoRow label={t("vault.doc_type")} value={t("doctype." + doc.type)} />
          <InfoRow label={t("vault.status_label")} value={statusValue} divider />
          {securedDate ? (
            <InfoRow label={t("vault.anchored_date")} value={securedDate} divider />
          ) : null}
        </View>

        {/* Actions */}
        {isAnchored ? (
          <PrimaryAction
            icon="language"
            label={t("vault.translate_doc")}
            onPress={() => Alert.alert(t("common.soon"), t("vault.translate_soon_body"))}
          />
        ) : (
          <PrimaryAction
            icon="shield-checkmark"
            label={anchoring ? t("vault.anchoring") : t("vault.anchor")}
            loading={anchoring}
            onPress={handleAnchor}
          />
        )}
        <TouchableOpacity
          style={[styles.secondaryBtn, { flexDirection: dir.row }]}
          activeOpacity={0.85}
          onPress={() => Alert.alert(t("common.soon"), t("vault.share_soon_body"))}
        >
          <Ionicons name="share-social-outline" size={18} color={colors.textPrimary} />
          <ArabicText weight="semibold" color={colors.textPrimary} style={styles.secondaryText}>
            {t("vault.share")}
          </ArabicText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryAction({
  icon,
  label,
  onPress,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  const dir = useDirection();
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, { flexDirection: dir.row }]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      <LinearGradient
        colors={[colors.goldGradTop, colors.goldGradBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={icon} size={19} color={colors.inkBlue} />
      <ArabicText weight="semibold" color={colors.inkBlue} style={styles.primaryText}>
        {label}
      </ArabicText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  headerTitle: { fontSize: 16, lineHeight: 24, flex: 1, textAlign: "center" },
  headerSpacer: { width: 40 },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 16,
  },

  // Hero
  hero: {
    height: 208,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    justifyContent: "flex-end",
  },
  heroContent: { padding: 20, alignItems: "flex-end", gap: 10 },
  statusTag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusTagText: { fontSize: 11, lineHeight: 16.5 },
  heroTitle: { fontSize: 26, lineHeight: 31.2, textAlign: "right" },
  heroMetaRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  heroMeta: { fontSize: 12.5, lineHeight: 18.75 },

  // Expiry highlight
  expiryCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60.6,
    paddingHorizontal: 20.8,
    borderRadius: 20,
    backgroundColor: colors.cardFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  expiryDate: { fontSize: 18, lineHeight: 27, letterSpacing: 0.5 },
  expiryLabel: { fontSize: 13, lineHeight: 19.5 },

  // Info card
  infoCard: {
    paddingHorizontal: 20.8,
    borderRadius: 20,
    backgroundColor: colors.cardFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  infoRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  infoValue: { fontSize: 14.5, lineHeight: 21.75 },
  infoLabel: { fontSize: 13, lineHeight: 19.5 },

  // Primary action
  primaryBtn: {
    height: 56,
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryText: { fontSize: 16, lineHeight: 24 },

  // Secondary action
  secondaryBtn: {
    height: 54,
    borderRadius: 24,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.cardFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  secondaryText: { fontSize: 15, lineHeight: 22.5 },
});

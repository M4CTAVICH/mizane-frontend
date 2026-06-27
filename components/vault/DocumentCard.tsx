import React from "react";
import { TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../../constants/tokens";
import { DOC_THUMBNAILS, DOC_THUMBNAIL_FALLBACK } from "../../constants/assets";
import { useDirection } from "../../lib/direction";
import ArabicText from "../shared/ArabicText";
import type { VaultDocument } from "../../store/vaultStore";

interface DocumentCardProps {
  document: VaultDocument;
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Status → accent colour + i18n key for the short corner tag.
function statusMeta(status: VaultDocument["status"]): { color: string; labelKey: string } {
  switch (status) {
    case "valid":
      return { color: colors.safe, labelKey: "vault.status.valid" };
    case "expiring":
      return { color: colors.caution, labelKey: "vault.status.expiring" };
    case "expired":
      return { color: colors.danger, labelKey: "vault.status.expired" };
    default:
      return { color: colors.textMuted, labelKey: "vault.status.unverified" };
  }
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const dir = useDirection();
  const { color, labelKey } = statusMeta(doc.status);
  const label = t(labelKey);
  const days = daysUntil(doc.expiresAt);
  const thumbnail = DOC_THUMBNAILS[doc.type] ?? DOC_THUMBNAIL_FALLBACK;

  const expiryText =
    doc.status === "expiring" && days !== null && days > 0
      ? t("vault.expiring_days", { count: days })
      : doc.status === "expired"
        ? t("vault.expired_long")
        : doc.expiresAt
          ? t("vault.valid_until", {
              date: new Date(doc.expiresAt).toLocaleDateString("ar-DZ"),
            })
          : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/vault/${doc.id}`)}
      activeOpacity={0.85}
      style={styles.card}
    >
      {/* Thumbnail with a fade into the card body */}
      <View style={styles.thumbWrap}>
        <Image source={thumbnail} style={styles.thumb} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(5,5,6,0)", "rgba(5,5,6,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Content (aligned to the reading edge) */}
      <View style={[styles.content, { alignItems: dir.alignStart }]}>
        <View style={[styles.tag, { backgroundColor: `${color}1F` }]}>
          <ArabicText size="caption" weight="semibold" color={color} style={styles.tagText}>
            {label}
          </ArabicText>
        </View>
        <ArabicText
          weight="semibold"
          color={colors.textPrimary}
          numberOfLines={1}
          style={[styles.title, { textAlign: dir.textAlign }]}
        >
          {t("doctype." + doc.type)}
        </ArabicText>
        {expiryText ? (
          <ArabicText
            size="caption"
            color={colors.textMuted}
            style={[styles.expiry, { textAlign: dir.textAlign }]}
          >
            {expiryText}
          </ArabicText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 96,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFill,
  },
  thumbWrap: {
    width: 88,
    alignSelf: "stretch",
  },
  thumb: { width: "100%", height: "100%" },
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  tag: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, lineHeight: 16 },
  title: { fontSize: 16, textAlign: "right" },
  expiry: { fontSize: 12, textAlign: "right" },
});

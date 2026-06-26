import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "../../constants/tokens";
import { DocumentType } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";
import ContentCard from "../ui/ContentCard";
import StatusPill from "../ui/StatusPill";
import ProofBadge from "../shared/ProofBadge";
import type { VaultDocument } from "../../store/vaultStore";

interface DocumentCardProps {
  document: VaultDocument;
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const router = useRouter();
  const docInfo = DocumentType[doc.type];
  const days = daysUntil(doc.expiresAt);

  // Trust state → content-layer variant (Apple HIG): expired = flagged,
  // proof-anchored = verified, everything else = default deep matte.
  const variant =
    doc.status === "expired" ? "flagged" : doc.anchorRef ? "verified" : "default";

  const accent =
    doc.status === "expired"
      ? colors.danger
      : doc.status === "expiring"
        ? colors.caution
        : doc.anchorRef
          ? colors.safe
          : colors.gold;

  const expiryText =
    doc.status === "expiring" && days !== null && days > 0
      ? `تنتهي خلال ${days} يوم`
      : doc.status === "expired"
        ? "منتهية الصلاحية"
        : doc.expiresAt
          ? `صالحة حتى ${new Date(doc.expiresAt).toLocaleDateString("ar-DZ")}`
          : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/vault/${doc.id}`)}
      activeOpacity={0.85}
    >
      <ContentCard variant={variant} style={styles.card}>
        <View style={styles.iconCol}>
          <View style={[styles.iconBg, { backgroundColor: `${accent}1F` }]}>
            <Ionicons
              name={docInfo?.icon as any ?? "document-outline"}
              size={22}
              color={accent}
            />
          </View>
        </View>
        <View style={styles.center}>
          <ArabicText weight="medium" color={colors.textPrimary} numberOfLines={1}>
            {doc.name}
          </ArabicText>
          {expiryText ? (
            <ArabicText
              size="caption"
              color={
                doc.status === "expiring"
                  ? colors.caution
                  : doc.status === "expired"
                    ? colors.danger
                    : colors.textMuted
              }
            >
              {expiryText}
            </ArabicText>
          ) : null}
          {doc.anchorRef ? <ProofBadge timestamp={doc.expiresAt} /> : null}
        </View>
        <View style={styles.rightCol}>
          <StatusPill status={doc.status} />
          <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        </View>
      </ContentCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCol: {},
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    gap: 4,
    alignItems: "flex-end",
  },
  rightCol: {
    alignItems: "center",
    gap: spacing.xs,
  },
});

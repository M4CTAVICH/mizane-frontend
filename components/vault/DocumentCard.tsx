import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius, shadow, spacing } from "../../constants/tokens";
import { DocumentType } from "../../constants/tokens";
import ArabicText from "../shared/ArabicText";
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
      style={[
        styles.card,
        doc.status === "expiring" && styles.cardExpiring,
        doc.status === "expired" && styles.cardExpired,
      ]}
      onPress={() => router.push(`/vault/${doc.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.iconCol}>
        <View
          style={[
            styles.iconBg,
            doc.status === "expired" ? styles.iconBgExpired : {},
          ]}
        >
          <Ionicons
            name={docInfo?.icon as any ?? "document-outline"}
            size={22}
            color={
              doc.status === "expired"
                ? colors.danger
                : doc.status === "expiring"
                  ? colors.caution
                  : colors.justiceGold
            }
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
        {doc.anchorRef ? (
          <ProofBadge timestamp={doc.expiresAt} />
        ) : null}
      </View>
      <View style={styles.rightCol}>
        <StatusPill status={doc.status} />
        <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ink200,
    ...shadow.sm,
  },
  cardExpiring: {
    borderColor: colors.caution,
    backgroundColor: colors.cautionLight,
  },
  cardExpired: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  iconCol: {},
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.justiceGold}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBgExpired: { backgroundColor: `${colors.danger}15` },
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

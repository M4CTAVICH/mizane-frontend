import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, shadow, spacing, typography } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import { DocumentType } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";
import StatusPill from "../../components/ui/StatusPill";
import ProofBadge from "../../components/shared/ProofBadge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { mockAnchor } from "../../lib/proof";

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { documents, updateDocument } = useVaultStore();
  const [anchoring, setAnchoring] = useState(false);

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <ArabicText color={colors.textMuted}>الوثيقة غير موجودة</ArabicText>
          <Button variant="ghost" onPress={() => router.back()}>
            رجوع
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const docInfo = DocumentType[doc.type];
  const days = daysUntil(doc.expiresAt);

  const handleAnchor = async () => {
    setAnchoring(true);
    await new Promise((r) => setTimeout(r, 1500));
    const proof = mockAnchor(doc.id);
    updateDocument(doc.id, { anchorRef: proof.anchorRef });
    setAnchoring(false);
    Alert.alert("تم التثبيت", `رمز التحقق:\n${proof.anchorRef}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <ArabicText weight="semibold" color={colors.textPrimary} numberOfLines={1}>
          {doc.name}
        </ArabicText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        {doc.status === "expiring" && days !== null && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={18} color={colors.caution} />
            <ArabicText color={colors.caution} weight="medium">
              تنتهي صلاحية هذه الوثيقة خلال {days} يوم
            </ArabicText>
          </View>
        )}
        {doc.status === "expired" && (
          <View style={styles.dangerBanner}>
            <Ionicons name="close-circle" size={18} color={colors.danger} />
            <ArabicText color={colors.danger} weight="medium">
              هذه الوثيقة منتهية الصلاحية
            </ArabicText>
          </View>
        )}

        {/* Document preview card */}
        <Card style={styles.previewCard}>
          <View style={styles.previewIcon}>
            <Ionicons
              name={docInfo?.icon as any ?? "document-outline"}
              size={48}
              color={colors.justiceGold}
            />
          </View>
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary} style={{ textAlign: "center" }}>
            {doc.name}
          </ArabicText>
          <View style={styles.pillRow}>
            <StatusPill status={doc.status} />
          </View>
          {doc.expiresAt && (
            <ArabicText size="caption" color={colors.textMuted} style={{ textAlign: "center" }}>
              صالحة حتى {new Date(doc.expiresAt).toLocaleDateString("ar-DZ")}
            </ArabicText>
          )}
          {doc.anchorRef && (
            <ProofBadge timestamp={doc.expiresAt} />
          )}
        </Card>

        {/* Metadata */}
        <Card>
          <View style={styles.metaRow}>
            <ArabicText size="caption" color={colors.textMuted}>نوع الوثيقة</ArabicText>
            <ArabicText size="caption" color={colors.textSecondary} weight="medium">
              {docInfo?.label ?? doc.type}
            </ArabicText>
          </View>
          {doc.issuedAt && (
            <View style={[styles.metaRow, styles.metaRowBorder]}>
              <ArabicText size="caption" color={colors.textMuted}>تاريخ الإصدار</ArabicText>
              <ArabicText size="caption" color={colors.textSecondary} weight="medium">
                {new Date(doc.issuedAt).toLocaleDateString("ar-DZ")}
              </ArabicText>
            </View>
          )}
          {doc.hash && (
            <View style={[styles.metaRow, styles.metaRowBorder]}>
              <ArabicText size="caption" color={colors.textMuted}>الرمز التشفيري</ArabicText>
              <ArabicText
                size="caption"
                color={colors.ink400}
                style={{ fontFamily: typography.fontMono, letterSpacing: 1 }}
              >
                {doc.hash.substring(0, 16)}...
              </ArabicText>
            </View>
          )}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {!doc.anchorRef && (
            <Button
              variant="primary"
              loading={anchoring}
              onPress={handleAnchor}
            >
              {anchoring ? "جارٍ التثبيت..." : "تثبيت الإثبات"}
            </Button>
          )}
          <Button variant="secondary" onPress={() => Alert.alert("قريباً", "ميزة الترجمة قادمة")}>
            ترجمة الوثيقة
          </Button>
          <Button variant="ghost" onPress={() => Alert.alert("قريباً", "ميزة المشاركة قادمة")}>
            مشاركة
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  warningBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.cautionLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.caution,
  },
  dangerBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  previewCard: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
  previewIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: `${colors.justiceGold}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  pillRow: { flexDirection: "row", justifyContent: "center" },
  metaRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  metaRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
  },
  actions: { gap: spacing.sm },
});

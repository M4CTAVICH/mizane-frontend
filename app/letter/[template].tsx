import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { colors, radius, shadow, spacing, typography, textScale } from "../../constants/tokens";
import { TEMPLATES } from "../../constants/tokens";
import { useAuthStore } from "../../store/authStore";
import { lettersApi, proofApi } from "../../lib/api";
import { toApiTemplateKey, toStoreCitations } from "../../lib/mappers";
import type { Citation as StoreCitation } from "../../store/assistantStore";
import ArabicText from "../../components/shared/ArabicText";
import Button from "../../components/ui/Button";
import ContentCard from "../../components/ui/ContentCard";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import CitationCard from "../../components/assistant/CitationCard";
import { useDirection } from "../../lib/direction";

/** Floating glass header pill shared across the letter steps. */
function GlassHeader({ children }: { children: React.ReactNode }) {
  const dir = useDirection();
  return (
    <View style={styles.headerWrap}>
      <LiquidGlassContainer radius={radius.lg} padding={spacing.md}>
        <View style={[styles.headerRow, { flexDirection: dir.row }]}>{children}</View>
      </LiquidGlassContainer>
    </View>
  );
}

export default function LetterScreen() {
  const { t } = useTranslation();
  const dir = useDirection();
  const { template } = useLocalSearchParams<{ template: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const templateInfo = TEMPLATES.find((tpl) => tpl.id === template) ?? TEMPLATES[0];

  const [step, setStep] = useState<"select" | "form" | "preview">("select");
  const [situation, setSituation] = useState("");
  const [generating, setGenerating] = useState(false);
  const [letterContent, setLetterContent] = useState("");
  const [letterId, setLetterId] = useState<string | null>(null);
  const [letterSha, setLetterSha] = useState<string | null>(null);
  const [citations, setCitations] = useState<StoreCitation[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templateInfo);

  const handleGenerate = async () => {
    if (!situation.trim()) {
      Alert.alert("الحالة مطلوبة", "اكتب وصفًا موجزًا لحالتك أولاً.");
      return;
    }
    setGenerating(true);
    try {
      const result = await lettersApi.generate({
        templateKey: toApiTemplateKey(selectedTemplate.id),
        situation: situation.trim(),
      });
      setLetterContent(result.content);
      setLetterId(result.id);
      setLetterSha(result.sha256);
      setCitations(toStoreCitations(result.citations as any));
      setStep("preview");
    } catch (e: any) {
      const msg =
        e?.response?.status === 401
          ? "انتهت الجلسة. سجّل الدخول من جديد."
          : "تعذّر توليد الرسالة. تأكّد من الاتصال وحاول مجددًا.";
      Alert.alert("خطأ", msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!letterId) {
      Alert.alert("قريباً", "ولّد الرسالة أولاً لتحميل PDF.");
      return;
    }
    setDownloading(true);
    try {
      const { downloadUrl } = await lettersApi.pdf(letterId);
      await Linking.openURL(downloadUrl);
    } catch {
      Alert.alert("خطأ", "تعذّر إنشاء ملف PDF. حاول مجدداً.");
    } finally {
      setDownloading(false);
    }
  };

  const handleAnchor = async () => {
    if (!letterSha) {
      Alert.alert("قريباً", "ولّد الرسالة أولاً لتثبيت الإثبات.");
      return;
    }
    try {
      await proofApi.anchor(letterSha);
      Alert.alert("تم", "تم إرسال الرسالة للتثبيت (قيد المعالجة).");
    } catch {
      Alert.alert("خطأ", "تعذّر تثبيت الإثبات. حاول مجدداً.");
    }
  };

  if (step === "select") {
    return (
      <SafeAreaView style={styles.container}>
        <GlassHeader>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <ArabicText weight="semibold" color={colors.textPrimary}>
            {t("letter.select_template")}
          </ArabicText>
          <View style={{ width: 36 }} />
        </GlassHeader>
        <ScrollView contentContainerStyle={styles.templateGrid}>
          {TEMPLATES.map((tpl) => (
            <TouchableOpacity
              key={tpl.id}
              style={[
                styles.templateCard,
                selectedTemplate.id === tpl.id && styles.templateCardSelected,
              ]}
              onPress={() => {
                setSelectedTemplate(tpl);
                setStep("form");
              }}
              activeOpacity={0.8}
            >
              <View style={styles.templateIcon}>
                <Ionicons name={tpl.icon as any} size={24} color={colors.gold} />
              </View>
              <ArabicText weight="medium" color={colors.textPrimary} style={{ textAlign: "center", fontSize: 14 }}>
                {t("template." + tpl.id)}
              </ArabicText>
              <Text style={[textScale.label, { textAlign: "center" }]}>
                {dir.isRTL ? tpl.labelFr : tpl.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === "form") {
    return (
      <SafeAreaView style={styles.container}>
        <GlassHeader>
          <TouchableOpacity onPress={() => setStep("select")}>
            <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <ArabicText weight="semibold" color={colors.textPrimary}>
            {t("template." + selectedTemplate.id)}
          </ArabicText>
          <View style={{ width: 36 }} />
        </GlassHeader>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Auto-filled from vault */}
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            {t("letter.your_data")}
          </ArabicText>
          <ContentCard>
            <View style={[styles.autoFillRow, { flexDirection: dir.row }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.safe} />
              <ArabicText size="caption" color={colors.textMuted}>
                {t("letter.autofilled")}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, { flexDirection: dir.row }]}>
              <ArabicText size="caption" color={colors.textMuted}>{t("letter.field_name")}</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary}>
                {user?.name || "—"}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, styles.dataRowBorder, { flexDirection: dir.row }]}>
              <ArabicText size="caption" color={colors.textMuted}>{t("letter.field_nin")}</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary} style={{ fontFamily: typography.fontMono }}>
                {user?.nin || "—"}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, styles.dataRowBorder, { flexDirection: dir.row }]}>
              <ArabicText size="caption" color={colors.textMuted}>الهاتف:</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary} style={{ fontFamily: typography.fontMono }}>
                {user?.phone || "—"}
              </ArabicText>
            </View>
          </ContentCard>

          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            {t("letter.situation")}
          </ArabicText>
          <TextInput
            style={[styles.situationInput, { textAlign: dir.textAlign, writingDirection: dir.writingDirection }]}
            value={situation}
            onChangeText={setSituation}
            placeholder={t("letter.situation_placeholder")}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.85}
            style={generating && { opacity: 0.6 }}
          >
            <LiquidGlassContainer radius={radius.xl} padding={0} intensity={50} prominent style={shadow.gold}>
              <View style={styles.glassCta}>
                <ArabicText weight="semibold" color={colors.gold} style={{ fontSize: 16 }}>
                  {generating ? t("letter.generating") : t("letter.generate_ai")}
                </ArabicText>
              </View>
            </LiquidGlassContainer>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Preview step
  return (
    <SafeAreaView style={styles.container}>
      <GlassHeader>
        <TouchableOpacity onPress={() => setStep("form")}>
          <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <ArabicText weight="semibold" color={colors.textPrimary}>
          {t("letter.preview_title")}
        </ArabicText>
        <TouchableOpacity>
          <Ionicons name="pencil-outline" size={22} color={colors.gold} />
        </TouchableOpacity>
      </GlassHeader>

      <ScrollView contentContainerStyle={styles.previewContent}>
        {/* Letter card */}
        <ContentCard variant="raised" padding={spacing.lg} style={styles.letterCard}>
          {/* Letter header */}
          <View style={[styles.letterHeader, { flexDirection: dir.row }]}>
            <ArabicText size="caption" color={colors.textMuted}>
              {new Date().toLocaleDateString("ar-DZ")}
            </ArabicText>
            <ArabicText weight="semibold" color={colors.textPrimary}>
              {user?.name || "—"}
            </ArabicText>
          </View>
          {/* Letter body */}
          <ArabicText
            style={styles.letterBody}
            color={colors.textPrimary}
          >
            {letterContent}
          </ArabicText>
        </ContentCard>

        {/* Citations */}
        {citations.length > 0 && (
          <View style={styles.citationsSection}>
            <ArabicText weight="medium" color={colors.textSecondary}>
              {t("letter.legal_sources")}
            </ArabicText>
            {citations.map((c, idx) => (
              <CitationCard key={idx} citation={c} />
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="primary" onPress={handleDownloadPdf} disabled={downloading}>
            {downloading ? "جارٍ التحميل..." : t("letter.download_pdf")}
          </Button>
          <Button variant="secondary" onPress={handleAnchor}>
            {t("letter.anchor")}
          </Button>
          <Button variant="ghost" onPress={() => router.push("/(tabs)")}>
            {t("letter.back_home")}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  headerWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  templateGrid: {
    padding: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  templateCard: {
    width: "47%",
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    ...shadow.sm,
  },
  templateCardSelected: {
    borderColor: colors.gold,
  },
  templateIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: `${colors.gold}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  glassCta: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  formContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  autoFillRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dataRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  dataRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
  },
  situationInput: {
    backgroundColor: colors.surface1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    padding: spacing.md,
    fontSize: 15,
    fontFamily: typography.fontArabic,
    color: colors.textPrimary,
    minHeight: 140,
    textAlign: "right",
    writingDirection: "rtl",
  },
  previewContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  letterCard: {
    gap: spacing.md,
  },
  letterHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  letterBody: {
    lineHeight: 26,
    fontSize: 14,
    textAlign: "right",
    writingDirection: "rtl",
  },
  citationsSection: {
    gap: spacing.sm,
  },
  actions: { gap: spacing.sm },
});

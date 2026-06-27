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
import { colors, radius, shadow, spacing, typography, textScale } from "../../constants/tokens";
import { TEMPLATES } from "../../constants/tokens";
import { useAuthStore } from "../../store/authStore";
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

const DEMO_LETTER = `السيد المحترم / السيدة المحترمة،

رئيس مفتشية العمل لولاية وهران

الموضوع: **شكوى بشأن الفصل التعسفي من العمل**

أنا الموقع أدناه، **أمل حميدي**، المقيمة بحي 20 أوت، وهران، رقم البطاقة الوطنية: 123456789012345678، أتقدم بهذه الشكوى ضد مؤسسة [اسم المؤسسة] بسبب فصلي التعسفي من العمل بتاريخ [التاريخ].

**عرض الوقائع:**
تربطني بالمؤسسة عقد عمل مبرم بتاريخ [تاريخ بداية العقد]. وبتاريخ [تاريخ الفصل]، أُبلغت بالفصل دون إشعار مسبق يستوفي الشروط القانونية المنصوص عليها في القانون رقم 90-11.

**المطالب:**
1. إعادة الإدماج في منصب العمل، أو
2. دفع التعويضات المستحقة وفق القانون

أرجو اتخاذ الإجراءات اللازمة وفق صلاحياتكم.

مع التحية.

[توقيع]

أمل حميدي
التاريخ: ${new Date().toLocaleDateString("ar-DZ")}`;

const DEMO_CITATIONS = [
  {
    article: "المادة 73",
    law: "القانون رقم 90-11",
    text: "لا يجوز فصل العامل دون إخطار مسبق مدته 30 يومًا على الأقل.",
  },
  {
    article: "المادة 81",
    law: "القانون رقم 90-11",
    text: "يحق للعامل المفصول تعسفياً المطالبة بإعادة الإدماج أو التعويض.",
  },
];

export default function LetterScreen() {
  const { t } = useTranslation();
  const dir = useDirection();
  const { template } = useLocalSearchParams<{ template: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const templateInfo = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];

  const [step, setStep] = useState<"select" | "form" | "preview">("select");
  const [situation, setSituation] = useState("");
  const [generating, setGenerating] = useState(false);
  const [letterContent, setLetterContent] = useState(DEMO_LETTER);
  const [selectedTemplate, setSelectedTemplate] = useState(templateInfo);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setStep("preview");
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
                {user?.name ?? "أمل حميدي"}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, styles.dataRowBorder, { flexDirection: dir.row }]}>
              <ArabicText size="caption" color={colors.textMuted}>{t("letter.field_nin")}</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary} style={{ fontFamily: typography.fontMono }}>
                {user?.nin ?? "123456789012345678"}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, styles.dataRowBorder, { flexDirection: dir.row }]}>
              <ArabicText size="caption" color={colors.textMuted}>{t("letter.field_address")}</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary}>
                {user?.address ?? "حي 20 أوت، وهران"}
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
              {user?.name ?? "أمل حميدي"}
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
        <View style={styles.citationsSection}>
          <ArabicText weight="medium" color={colors.textSecondary}>
            {t("letter.legal_sources")}
          </ArabicText>
          {DEMO_CITATIONS.map((c, idx) => (
            <CitationCard key={idx} citation={c} />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="primary" onPress={() => Alert.alert(t("common.soon"), t("letter.pdf_soon_body"))}>
            {t("letter.download_pdf")}
          </Button>
          <Button variant="secondary" onPress={() => Alert.alert(t("common.soon"), t("letter.anchor_soon_body"))}>
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

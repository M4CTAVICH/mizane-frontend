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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, shadow, spacing, typography, textScale } from "../../constants/tokens";
import { TEMPLATES } from "../../constants/tokens";
import { useAuthStore } from "../../store/authStore";
import ArabicText from "../../components/shared/ArabicText";
import Button from "../../components/ui/Button";
import ContentCard from "../../components/ui/ContentCard";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import CitationCard from "../../components/assistant/CitationCard";

/** Floating glass header (functional layer) shared across the letter steps. */
function GlassHeader({ children }: { children: React.ReactNode }) {
  return (
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
      <View style={styles.headerRow}>{children}</View>
      <View style={styles.headerHairline} />
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
            اختر نوع الرسالة
          </ArabicText>
          <View style={{ width: 36 }} />
        </GlassHeader>
        <ScrollView contentContainerStyle={styles.templateGrid}>
          {TEMPLATES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.templateCard,
                selectedTemplate.id === t.id && styles.templateCardSelected,
              ]}
              onPress={() => {
                setSelectedTemplate(t);
                setStep("form");
              }}
              activeOpacity={0.8}
            >
              <View style={styles.templateIcon}>
                <Ionicons name={t.icon as any} size={24} color={colors.gold} />
              </View>
              <ArabicText weight="medium" color={colors.textPrimary} style={{ textAlign: "center", fontSize: 14 }}>
                {t.label}
              </ArabicText>
              <Text style={[textScale.label, { textAlign: "center" }]}>
                {t.labelFr}
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
            {selectedTemplate.label}
          </ArabicText>
          <View style={{ width: 36 }} />
        </GlassHeader>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Auto-filled from vault */}
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            بياناتك
          </ArabicText>
          <ContentCard>
            <View style={styles.autoFillRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.safe} />
              <ArabicText size="caption" color={colors.textMuted}>
                تم ملء البيانات تلقائياً من الخزينة
              </ArabicText>
            </View>
            <View style={styles.dataRow}>
              <ArabicText size="caption" color={colors.textMuted}>الاسم:</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary}>
                {user?.name ?? "أمل حميدي"}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, styles.dataRowBorder]}>
              <ArabicText size="caption" color={colors.textMuted}>رقم التعريف:</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary} style={{ fontFamily: typography.fontMono }}>
                {user?.nin ?? "123456789012345678"}
              </ArabicText>
            </View>
            <View style={[styles.dataRow, styles.dataRowBorder]}>
              <ArabicText size="caption" color={colors.textMuted}>العنوان:</ArabicText>
              <ArabicText size="caption" weight="medium" color={colors.textPrimary}>
                {user?.address ?? "حي 20 أوت، وهران"}
              </ArabicText>
            </View>
          </ContentCard>

          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            وصف الحالة
          </ArabicText>
          <TextInput
            style={styles.situationInput}
            value={situation}
            onChangeText={setSituation}
            placeholder="اشرح حالتك بإيجاز... مثلاً: تم فصلي من العمل دون سبب وجيه في تاريخ..."
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
                  {generating ? "جارٍ توليد الرسالة..." : "توليد الرسالة بالذكاء الاصطناعي"}
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
          معاينة الرسالة
        </ArabicText>
        <TouchableOpacity>
          <Ionicons name="pencil-outline" size={22} color={colors.gold} />
        </TouchableOpacity>
      </GlassHeader>

      <ScrollView contentContainerStyle={styles.previewContent}>
        {/* Letter card */}
        <ContentCard variant="raised" padding={spacing.lg} style={styles.letterCard}>
          {/* Letter header */}
          <View style={styles.letterHeader}>
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
            المصادر القانونية
          </ArabicText>
          {DEMO_CITATIONS.map((c, idx) => (
            <CitationCard key={idx} citation={c} />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="primary" onPress={() => Alert.alert("قريباً", "تحميل PDF سيكون متاحاً قريباً")}>
            تحميل PDF
          </Button>
          <Button variant="secondary" onPress={() => Alert.alert("قريباً", "التثبيت متاح قريباً")}>
            تثبيت الإثبات
          </Button>
          <Button variant="ghost" onPress={() => router.push("/(tabs)")}>
            العودة للرئيسية
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerHairline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassBorder,
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

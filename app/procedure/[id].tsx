import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { DocumentType } from "../../constants/tokens";
import { PROCEDURE_META } from "../../constants/procedureMeta";
import { useVaultStore } from "../../store/vaultStore";
import { proceduresApi } from "../../lib/api";
import { toAppDocType } from "../../lib/mappers";
import ArabicText from "../../components/shared/ArabicText";
import Button from "../../components/ui/Button";
import ContentCard from "../../components/ui/ContentCard";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import type {
  DeadlineResult,
  ProcedureDto,
  ProcedureInstance,
  ProcedureKey,
} from "../../types/api";

function toArabicDigits(value: string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return value.replace(/[0-9]/g, (d) => map[Number(d)]);
}

export default function ProcedureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const documents = useVaultStore((s) => s.documents);

  const key = id as ProcedureKey;
  const meta = PROCEDURE_META[key];
  const [procedure, setProcedure] = useState<ProcedureDto | null>(null);
  const [instance, setInstance] = useState<ProcedureInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [deadline, setDeadline] = useState<DeadlineResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;
    // Catalog gives the playbook; instances/me tells us if this user already
    // started it and carries server-computed readiness (brief §4). The fixed
    // `instances/me` path must be requested as-is — never as a :key.
    Promise.all([
      proceduresApi.catalog(),
      proceduresApi.myInstances().catch(() => [] as ProcedureInstance[]),
    ])
      .then(([rows, instances]) => {
        if (!active) return;
        setProcedure(rows.find((p) => p.key === key) ?? null);
        setInstance(instances.find((i) => i.procedure?.key === key) ?? null);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key]);

  const steps = procedure?.steps ?? [];
  const requiredDocs = (procedure?.requiredDocTypes ?? []).map(toAppDocType);

  // Prefer the server's readiness once the procedure is started; before that,
  // fall back to a local vault check against the catalog's requiredDocTypes.
  const presentSet = useMemo(
    () =>
      instance
        ? new Set(instance.readiness.present.map(toAppDocType))
        : null,
    [instance],
  );

  const handleCalculateDeadline = async () => {
    if (!eventDate || !meta?.noticeType) return;
    setCalcLoading(true);
    try {
      const res = await proceduresApi.deadlineCalc({
        noticeType: meta.noticeType,
        noticeDate: eventDate,
      });
      setDeadline(res);
    } catch {
      Alert.alert("خطأ", "تعذّر حساب الموعد. تحقّق من التاريخ (YYYY-MM-DD).");
    } finally {
      setCalcLoading(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      // start is idempotent — returns the (existing or new) instance with
      // readiness; keep it so the doc checklist reflects the server (brief §5).
      const view = await proceduresApi.start(key);
      setInstance(view);
      Alert.alert(
        "تم",
        view.readiness.ready
          ? "تم بدء الإجراء — جميع الوثائق جاهزة."
          : "تم بدء الإجراء وتتبّعه في حسابك.",
      );
    } catch (e: any) {
      Alert.alert(
        "خطأ",
        e?.response?.status === 401 ? "انتهت الجلسة." : "تعذّر بدء الإجراء.",
      );
    } finally {
      setStarting(false);
    }
  };

  const stepDocs = requiredDocs.map((docType) => {
    const found = documents.find((d) => d.type === docType);
    const inVault = presentSet ? presentSet.has(docType) : !!found;
    return { type: docType, inVault, doc: found };
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.gold} />
      </SafeAreaView>
    );
  }

  if (!procedure) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ArabicText color={colors.textMuted}>الإجراء غير موجود</ArabicText>
        <Button variant="ghost" onPress={() => router.back()}>رجوع</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Floating glass header pill (functional layer) ─────────── */}
      <View style={styles.headerWrap}>
        <LiquidGlassContainer radius={radius.lg} padding={spacing.md}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <ArabicText weight="semibold" color={colors.textPrimary} numberOfLines={1}>
              {procedure.title?.ar ?? key}
            </ArabicText>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.gold} />
            </TouchableOpacity>
          </View>
        </LiquidGlassContainer>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress stepper */}
        <ContentCard>
          <ArabicText size="caption" weight="medium" color={colors.textMuted} style={{ textAlign: "center", marginBottom: spacing.md }}>
            الخطوة {currentStep + 1} من {steps.length}
          </ArabicText>
          <View style={styles.stepper}>
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <TouchableOpacity
                  style={styles.stepItem}
                  onPress={() => setCurrentStep(idx)}
                >
                  <View
                    style={[
                      styles.stepDot,
                      idx < currentStep && styles.stepDotDone,
                      idx === currentStep && styles.stepDotActive,
                    ]}
                  >
                    {idx < currentStep ? (
                      <Ionicons name="checkmark" size={12} color={colors.inkBlue} />
                    ) : (
                      <ArabicText
                        size="caption"
                        color={idx === currentStep ? colors.inkBlue : colors.textMuted}
                        style={{ fontSize: 10, writingDirection: "ltr", textAlign: "center" }}
                      >
                        {idx + 1}
                      </ArabicText>
                    )}
                  </View>
                </TouchableOpacity>
                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      idx < currentStep && styles.stepLineDone,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </ContentCard>

        {/* Readiness banner — shown once the procedure is started (brief §4) */}
        {instance && (
          <View
            style={[
              styles.readinessBanner,
              {
                backgroundColor: instance.readiness.ready
                  ? `${colors.safe}1A`
                  : `${colors.caution}1A`,
              },
            ]}
          >
            <Ionicons
              name={instance.readiness.ready ? "checkmark-circle" : "alert-circle"}
              size={18}
              color={instance.readiness.ready ? colors.safe : colors.caution}
            />
            <ArabicText
              size="caption"
              weight="medium"
              color={instance.readiness.ready ? colors.safe : colors.caution}
              style={{ flex: 1, textAlign: "right" }}
            >
              {instance.readiness.ready
                ? "كل الوثائق المطلوبة جاهزة في خزينتك."
                : `ينقصك ${toArabicDigits(String(instance.readiness.missing.length))} وثيقة لإكمال الملف.`}
            </ArabicText>
          </View>
        )}

        {/* Current step content */}
        <ContentCard>
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            {steps[currentStep]?.title?.ar ?? ""}
          </ArabicText>
          {steps[currentStep]?.description?.ar ? (
            <ArabicText color={colors.textSecondary} style={{ textAlign: "right", marginTop: spacing.sm, lineHeight: 24 }}>
              {steps[currentStep].description.ar}
            </ArabicText>
          ) : null}

          {/* Required documents */}
          <ArabicText weight="medium" color={colors.textSecondary} style={styles.sectionLabel}>
            الوثائق المطلوبة:
          </ArabicText>
          {stepDocs.map((item, idx) => {
            const docInfo = DocumentType[item.type as keyof typeof DocumentType];
            return (
              <View key={idx} style={styles.docRow}>
                <TouchableOpacity
                  style={styles.docAction}
                  onPress={() =>
                    item.inVault
                      ? router.push(`/vault/${item.doc?.id}`)
                      : Alert.alert("إضافة وثيقة", "انتقل إلى الخزينة لإضافة الوثيقة")
                  }
                >
                  <ArabicText
                    size="caption"
                    color={item.inVault ? colors.safe : colors.gold}
                  >
                    {item.inVault ? "موجود في الخزينة" : "أضف →"}
                  </ArabicText>
                </TouchableOpacity>
                <View style={styles.docLabel}>
                  <Ionicons
                    name={item.inVault ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={item.inVault ? colors.safe : colors.textMuted}
                  />
                  <ArabicText
                    size="caption"
                    color={item.inVault ? colors.textPrimary : colors.textMuted}
                    weight={item.inVault ? "medium" : "regular"}
                  >
                    {docInfo?.label ?? item.type}
                  </ArabicText>
                </View>
              </View>
            );
          })}
        </ContentCard>

        {/* Deadline calculator */}
        {meta?.noticeType && (
          <ContentCard>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color={colors.gold} />
              <ArabicText weight="semibold" color={colors.textPrimary}>
                حساب المهلة القانونية
              </ArabicText>
            </View>
            <ArabicText size="caption" color={colors.textMuted}>
              أدخل تاريخ الإشعار لحساب آخر أجل للرد
            </ArabicText>
            <TextInput
              style={styles.dateInput}
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
              textAlign="center"
            />
            <Button
              variant="secondary"
              size="sm"
              onPress={handleCalculateDeadline}
              fullWidth={false}
              loading={calcLoading}
            >
              احسب الموعد النهائي
            </Button>
            {deadline && (
              <>
                <View style={styles.deadlineResult}>
                  <Ionicons name="warning" size={16} color={colors.caution} />
                  <ArabicText weight="semibold" color={colors.caution} style={{ flex: 1, textAlign: "right" }}>
                    {deadline.label?.ar ?? "الموعد النهائي"}: {new Date(deadline.dueDate).toLocaleDateString("ar-DZ")}
                    {" "}({toArabicDigits(String(deadline.days))} يوم)
                  </ArabicText>
                </View>
                {/* brief §6: a sample result is a placeholder, NOT verified law. */}
                {deadline.sample && (
                  <View style={styles.disclaimer}>
                    <Ionicons name="information-circle-outline" size={15} color={colors.textMuted} />
                    <ArabicText size="caption" color={colors.textMuted} style={{ flex: 1, textAlign: "right", lineHeight: 18 }}>
                      هذا تقدير تجريبي وليس نصًّا قانونيًا مؤكَّدًا — تحقّق من الأجل لدى جهة مختصة.
                    </ArabicText>
                  </View>
                )}
                {deadline.caveat && (
                  <ArabicText size="caption" color={colors.textMuted} style={{ textAlign: "right", marginTop: spacing.xs, lineHeight: 18 }}>
                    {deadline.caveat}
                  </ArabicText>
                )}
              </>
            )}
          </ContentCard>
        )}

        {/* Navigation buttons */}
        <View style={styles.navButtons}>
          {currentStep < steps.length - 1 ? (
            <Button
              variant="primary"
              onPress={() => setCurrentStep((s) => s + 1)}
            >
              الخطوة التالية →
            </Button>
          ) : (
            <Button variant="primary" onPress={handleStart} loading={starting}>
              {starting
                ? "جارٍ البدء..."
                : instance
                  ? "تحديث حالة الإجراء ✓"
                  : "ابدأ تتبّع الإجراء ✓"}
            </Button>
          )}
          {currentStep > 0 && (
            <Button
              variant="ghost"
              onPress={() => setCurrentStep((s) => s - 1)}
            >
              ← الخطوة السابقة
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  centered: { alignItems: "center", justifyContent: "center", gap: spacing.md },

  // Glass header
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
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
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: { alignItems: "center" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.ink300,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  stepDotDone: {
    backgroundColor: colors.safe,
    borderColor: colors.safe,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.ink200,
    maxWidth: 40,
  },
  stepLineDone: { backgroundColor: colors.safe },
  sectionLabel: { textAlign: "right", marginTop: spacing.md, marginBottom: spacing.sm },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  docRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  docLabel: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  docAction: { paddingLeft: spacing.sm },
  dateInput: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontFamily: typography.fontMono,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
    textAlign: "center",
    letterSpacing: 1,
  },
  deadlineResult: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.cautionLight,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  disclaimer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  readinessBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  navButtons: { gap: spacing.sm },
});

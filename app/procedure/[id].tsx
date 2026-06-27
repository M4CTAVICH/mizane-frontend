import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import { PROCEDURES } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import ArabicText from "../../components/shared/ArabicText";
import Button from "../../components/ui/Button";
import ContentCard from "../../components/ui/ContentCard";
import { LiquidGlassContainer } from "../../components/ui/LiquidGlassContainer";
import { useDirection } from "../../lib/direction";

export default function ProcedureDetailScreen() {
  const { t } = useTranslation();
  const dir = useDirection();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const documents = useVaultStore((s) => s.documents);

  const procedure = PROCEDURES.find((p) => p.id === id) ?? PROCEDURES[0];
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [deadline, setDeadline] = useState<string | null>(null);

  const handleCalculateDeadline = () => {
    if (!eventDate || !procedure.deadlines.length) return;
    const base = new Date(eventDate);
    const days = procedure.deadlines[0].days;
    base.setDate(base.getDate() + days);
    setDeadline(base.toLocaleDateString("ar-DZ"));
  };

  const stepDocs = procedure.requiredDocs.map((docType) => {
    const found = documents.find((d) => d.type === docType);
    return { type: docType, inVault: !!found, doc: found };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Floating glass header pill (functional layer) ─────────── */}
      <View style={styles.headerWrap}>
        <LiquidGlassContainer radius={radius.lg} padding={spacing.md}>
          <View style={[styles.headerRow, { flexDirection: dir.row }]}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-forward" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <ArabicText weight="semibold" color={colors.textPrimary} numberOfLines={1}>
              {t("proc." + procedure.id + ".title")}
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
            {t("procedure.step_counter", { current: currentStep + 1, total: procedure.steps.length })}
          </ArabicText>
          <View style={styles.stepper}>
            {procedure.steps.map((step, idx) => (
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
                {idx < procedure.steps.length - 1 && (
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

        {/* Current step content */}
        <ContentCard>
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            {t("proc." + procedure.id + ".step." + currentStep)}
          </ArabicText>

          {/* Required documents */}
          <ArabicText weight="medium" color={colors.textSecondary} style={[styles.sectionLabel, { textAlign: dir.textAlign }]}>
            {t("procedure.required_docs")}
          </ArabicText>
          {stepDocs.map((item, idx) => {
            return (
              <View key={idx} style={[styles.docRow, { flexDirection: dir.row }]}>
                <TouchableOpacity
                  style={styles.docAction}
                  onPress={() =>
                    item.inVault
                      ? router.push(`/vault/${item.doc?.id}`)
                      : Alert.alert(t("procedure.add_doc_title"), t("procedure.add_doc_body"))
                  }
                >
                  <ArabicText
                    size="caption"
                    color={item.inVault ? colors.safe : colors.gold}
                  >
                    {item.inVault ? t("procedure.in_vault") : t("procedure.add_arrow")}
                  </ArabicText>
                </TouchableOpacity>
                <View style={[styles.docLabel, { flexDirection: dir.row }]}>
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
                    {t("doctype." + item.type)}
                  </ArabicText>
                </View>
              </View>
            );
          })}
        </ContentCard>

        {/* Deadline calculator */}
        {procedure.deadlines.length > 0 && (
          <ContentCard>
            <View style={[styles.sectionHeader, { flexDirection: dir.row }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.gold} />
              <ArabicText weight="semibold" color={colors.textPrimary}>
                {t("proc." + procedure.id + ".deadline.0")}
              </ArabicText>
            </View>
            <ArabicText size="caption" color={colors.textMuted}>
              {t("procedure.deadline_info", { days: procedure.deadlines[0].days })}
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
            <Button variant="secondary" size="sm" onPress={handleCalculateDeadline} fullWidth={false}>
              {t("procedure.calculate_deadline")}
            </Button>
            {deadline && (
              <View style={[styles.deadlineResult, { flexDirection: dir.row }]}>
                <Ionicons name="warning" size={16} color={colors.caution} />
                <ArabicText weight="semibold" color={colors.caution}>
                  {t("procedure.deadline_result", { date: deadline })}
                </ArabicText>
              </View>
            )}
          </ContentCard>
        )}

        {/* Navigation buttons */}
        <View style={styles.navButtons}>
          {currentStep < procedure.steps.length - 1 ? (
            <Button
              variant="primary"
              onPress={() => setCurrentStep((s) => s + 1)}
            >
              {t("procedure.next_step")}
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={() => Alert.alert(t("procedure.done_title"), t("procedure.done_body"))}
            >
              {t("procedure.complete")}
            </Button>
          )}
          {currentStep > 0 && (
            <Button
              variant="ghost"
              onPress={() => setCurrentStep((s) => s - 1)}
            >
              {t("procedure.prev_step")}
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

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
  navButtons: { gap: spacing.sm },
});

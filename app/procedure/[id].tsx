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
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, shadow, spacing, typography } from "../../constants/tokens";
import { PROCEDURES, DocumentType } from "../../constants/tokens";
import { useVaultStore } from "../../store/vaultStore";
import ArabicText from "../../components/shared/ArabicText";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function ProcedureDetailScreen() {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={colors.parchment} />
        </TouchableOpacity>
        <ArabicText weight="semibold" color={colors.parchment} numberOfLines={1}>
          {procedure.label}
        </ArabicText>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.goldLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress stepper */}
        <Card>
          <ArabicText size="caption" weight="medium" color={colors.textMuted} style={{ textAlign: "center", marginBottom: spacing.md }}>
            الخطوة {currentStep + 1} من {procedure.steps.length}
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
                      <Ionicons name="checkmark" size={12} color="#fff" />
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
        </Card>

        {/* Current step content */}
        <Card>
          <ArabicText size="heading" weight="semibold" color={colors.textPrimary}>
            {procedure.steps[currentStep]}
          </ArabicText>

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
                    color={item.inVault ? colors.safe : colors.justiceGold}
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
        </Card>

        {/* Deadline calculator */}
        {procedure.deadlines.length > 0 && (
          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color={colors.justiceGold} />
              <ArabicText weight="semibold" color={colors.textPrimary}>
                {procedure.deadlines[0].name}
              </ArabicText>
            </View>
            <ArabicText size="caption" color={colors.textMuted}>
              المهلة: {procedure.deadlines[0].days} يومًا من تاريخ الحدث
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
              احسب الموعد النهائي
            </Button>
            {deadline && (
              <View style={styles.deadlineResult}>
                <Ionicons name="warning" size={16} color={colors.caution} />
                <ArabicText weight="semibold" color={colors.caution}>
                  الموعد النهائي: {deadline}
                </ArabicText>
              </View>
            )}
          </Card>
        )}

        {/* Navigation buttons */}
        <View style={styles.navButtons}>
          {currentStep < procedure.steps.length - 1 ? (
            <Button
              variant="primary"
              onPress={() => setCurrentStep((s) => s + 1)}
            >
              الخطوة التالية →
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={() => Alert.alert("مبروك!", "أكملت جميع الخطوات.")}
            >
              إتمام الإجراء ✓
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
  container: { flex: 1, backgroundColor: colors.surface0 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.inkBlue,
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
    backgroundColor: colors.justiceGold,
    borderColor: colors.justiceGold,
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

import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { colors, radius, spacing, typography } from "../../constants/tokens";
import ArabicText from "../../components/shared/ArabicText";
import LoadingState from "../../components/shared/LoadingState";
import BottomSheet from "../../components/ui/BottomSheet";
import DNAResult from "../../components/scan/DNAResult";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { scanApi } from "../../lib/api";

const DNA_CHECKS_DEMO = [
  { id: "official_stamp", label: "ختم رسمي موجود", passed: true },
  { id: "article_valid", label: "مراجع قانونية صحيحة", passed: true },
  { id: "date_format", label: "تاريخ صحيح", passed: true },
  { id: "registration_no", label: "رقم التسجيل", passed: false },
  { id: "signatory", label: "توقيع / ختم مُوقِّع", passed: true },
];

const FLAGS_DEMO = [
  { clause: "المادة 666", reason: "هذه المادة لا وجود لها في القانون الجزائري" },
];

interface ScanResult {
  documentType: string;
  summaryDarija: string;
  dnaChecks: typeof DNA_CHECKS_DEMO;
  flags: typeof FLAGS_DEMO;
  authentic: boolean;
}

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const cameraRef = useRef(null);

  const handleCapture = async () => {
    setProcessing(true);
    try {
      // Simulate API call with demo data
      await new Promise((r) => setTimeout(r, 2500));
      setResult({
        documentType: "إشعار إخلاء (Notice d'expulsion)",
        summaryDarija:
          "هاد الورقة فيها إشعار بالإخلاء. المدة 30 يوم من تاريخ التسليم. عندك الحق ترد عليهم كتابةً وتطلب تأجيل.",
        dnaChecks: DNA_CHECKS_DEMO,
        flags: FLAGS_DEMO,
        authentic: false,
      });
      setSheetVisible(true);
    } catch {
      Alert.alert("خطأ", "فشل تحليل الوثيقة. حاول مجدداً.");
    } finally {
      setProcessing(false);
    }
  };

  const handleGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) {
      handleCapture();
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.justiceGold} />
          <ArabicText size="heading" weight="semibold" color={colors.parchment} style={{ textAlign: "center" }}>
            نحتاج صلاحية الكاميرا
          </ArabicText>
          <Button variant="primary" onPress={requestPermission}>
            منح الصلاحية
          </Button>
          <TouchableOpacity onPress={() => router.back()}>
            <ArabicText size="caption" color={colors.ink300}>
              إغلاق
            </ArabicText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      {/* Overlay */}
      <View style={StyleSheet.absoluteFill}>
        {/* Top bar */}
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <ArabicText weight="semibold" color="#fff" style={styles.topTitle}>
              فحص وثيقة
            </ArabicText>
          </View>
        </SafeAreaView>

        {/* Scan frame */}
        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            {/* Corner guides */}
            {["TL", "TR", "BL", "BR"].map((corner) => (
              <View
                key={corner}
                style={[styles.corner, styles[`corner${corner}` as keyof typeof styles] as any]}
              />
            ))}
          </View>
          <ArabicText color="rgba(255,255,255,0.8)" style={{ textAlign: "center", marginTop: spacing.md }}>
            اصوّر الوثيقة داخل الإطار
          </ArabicText>
        </View>

        {/* Processing overlay */}
        {processing && (
          <View style={styles.processingOverlay}>
            <LoadingState
              message="جارٍ تحليل الوثيقة..."
              fullScreen={false}
            />
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery}>
            <Ionicons name="images-outline" size={22} color="#fff" />
            <ArabicText size="caption" color="#fff">
              المعرض
            </ArabicText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCapture}
            disabled={processing}
            activeOpacity={0.8}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>
      </View>

      {/* Results bottom sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="نتائج الفحص"
        maxHeight={680}
      >
        {result && (
          <View style={styles.resultsContent}>
            {/* Document type */}
            <Card variant={result.authentic ? "verified" : "flagged"}>
              <View style={styles.resultRow}>
                <Ionicons
                  name={result.authentic ? "checkmark-circle" : "warning"}
                  size={22}
                  color={result.authentic ? colors.safe : colors.danger}
                />
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <ArabicText weight="semibold" color={colors.textPrimary}>
                    {result.documentType}
                  </ArabicText>
                </View>
              </View>
            </Card>

            {/* Summary in Darija */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.justiceGold} />
                <ArabicText weight="medium" color={colors.textPrimary}>
                  ملخص بالدارجة
                </ArabicText>
              </View>
              <Card>
                <ArabicText color={colors.textSecondary} style={{ lineHeight: 24 }}>
                  {result.summaryDarija}
                </ArabicText>
              </Card>
            </View>

            {/* DNA checks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="fitness-outline" size={16} color={colors.justiceGold} />
                <ArabicText weight="medium" color={colors.textPrimary}>
                  فحص الأصالة
                </ArabicText>
              </View>
              <DNAResult checks={result.dnaChecks} authentic={result.authentic} />
            </View>

            {/* Abusive clauses */}
            {result.flags.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning-outline" size={16} color={colors.danger} />
                  <ArabicText weight="medium" color={colors.danger}>
                    بنود مشبوهة
                  </ArabicText>
                </View>
                <Card variant="flagged">
                  {result.flags.map((flag, idx) => (
                    <View key={idx} style={styles.flagItem}>
                      <ArabicText weight="medium" color={colors.danger}>
                        • {flag.clause}
                      </ArabicText>
                      <ArabicText size="caption" color={colors.textSecondary}>
                        {flag.reason}
                      </ArabicText>
                    </View>
                  ))}
                </Card>
              </View>
            )}

            {/* CTA buttons */}
            <View style={styles.ctaRow}>
              <Button
                variant="secondary"
                size="md"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => {
                  setSheetVisible(false);
                  router.push("/(tabs)");
                }}
              >
                اسأل ميزان
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => {
                  setSheetVisible(false);
                  router.push("/letter/eviction_response");
                }}
              >
                أنشئ ردًّا
              </Button>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permContainer: {
    flex: 1,
    backgroundColor: colors.inkBlue,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topTitle: { fontSize: 17 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  frameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 280,
    height: 380,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.justiceGold,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  galleryBtn: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.justiceGold,
  },
  resultsContent: { gap: spacing.md },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  flagItem: {
    gap: 4,
    alignItems: "flex-end",
    paddingVertical: spacing.xs,
  },
  ctaRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
